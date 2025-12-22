import type {
  CreateNoteRequest,
  Note,
  UpdateNoteRequest,
} from "@/lib/types/editor";
import type { ApiBuilder } from "./types";

interface BackendResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

const transformNote = (note: any): Note => ({
  id: note.id,
  userId: note.userId,
  title: note.title || "",
  content:
    typeof note.content === "string"
      ? JSON.parse(note.content)
      : note.content || null,
  pdfAnnotationId: note.pdfAnnotationId || null,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
  isDeleted: note.isDeleted || false,
  pdfId: note.pdfId || null,
});

export const notesEndpoints = (builder: ApiBuilder) => ({
  getNotes: builder.query<Note[], { pdfId?: string } | void>({
    query: (params) => ({
      url: "notes",
      params: params?.pdfId ? { pdfId: params.pdfId } : undefined,
    }),
    transformResponse: (response: BackendResponse<any[]>, meta, arg) => {
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch notes");
      }
      let notes = response.data.map(transformNote);

      // Client-side filtering for pdfId since backend doesn't support it yet
      if (arg?.pdfId) {
        notes = notes.filter((n) => n.pdfId === arg.pdfId);
      }

      return notes;
    },
    providesTags: (result) => [
      { type: "Note", id: "LIST" },
      ...(result?.map((note) => ({ type: "Note" as const, id: note.id })) ||
        []),
    ],
  }),

  getNote: builder.query<Note, string>({
    query: (noteId) => `notes/${noteId}`,
    transformResponse: (response: BackendResponse<any>) => {
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch note");
      }
      return transformNote(response.data);
    },
    providesTags: (_result, _error, noteId) => [{ type: "Note", id: noteId }],
  }),

  createNote: builder.mutation<Note, CreateNoteRequest>({
    query: (noteData) => ({
      url: "notes",
      method: "POST",
      body: noteData,
    }),
    transformResponse: (response: BackendResponse<any>) => {
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create note");
      }
      return transformNote(response.data);
    },
    invalidatesTags: [{ type: "Note", id: "LIST" }],
  }),

  updateNote: builder.mutation<
    Note,
    { id: string; updates: UpdateNoteRequest }
  >({
    query: ({ id, updates }) => ({
      url: `notes/${id}`,
      method: "PUT",
      body: updates,
    }),
    transformResponse: (response: BackendResponse<any>) => {
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update note");
      }
      return transformNote(response.data);
    },
    invalidatesTags: (_result, _error, { id }) => [
      { type: "Note", id: "LIST" },
      { type: "Note", id },
    ],
  }),

  deleteNote: builder.mutation<{ success: boolean }, string>({
    query: (noteId) => ({
      url: `notes/${noteId}`,
      method: "DELETE",
    }),
    transformResponse: (response: BackendResponse<any>) => {
      return { success: response.success };
    },
    invalidatesTags: (_result, _error, noteId) => [
      { type: "Note", id: "LIST" },
      { type: "Note", id: noteId },
    ],
  }),
});
