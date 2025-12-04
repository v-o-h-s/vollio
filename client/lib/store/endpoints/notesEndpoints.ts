import type {
  CreateNoteRequest,
  Note,
  SupabaseNoteResponse,
  SupabaseNotesListResponse,
  SupabaseSingleNoteFromListRepsonse,
  UpdateNoteRequest,
} from "@/lib/types/editor";
import type { ApiBuilder } from "./types";

const transformNote = (
  note: NonNullable<SupabaseNoteResponse["data"]>
): Note => ({
  ...note,
  content:
    typeof note.content === "string" ? JSON.parse(note.content) : note.content,
});

export const notesEndpoints = (builder: ApiBuilder) => ({
  getNotes: builder.query<
    SupabaseSingleNoteFromListRepsonse[],
    { pdfId?: string } | void
  >({
    query: (params) => ({
      url: "notes",
      params: params?.pdfId ? { pdfId: params.pdfId } : undefined,
    }),
    transformResponse: (response: SupabaseNotesListResponse) => {
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch notes");
      }
      return response.data;
    },
    providesTags: (result) => [
      { type: "Note", id: "LIST" },
      ...(result?.map((note) => ({ type: "Note" as const, id: note.id })) ||
        []),
    ],
  }),

  getNote: builder.query<Note, string>({
    query: (noteId) => `notes/${noteId}`,
    transformResponse: (response: SupabaseNoteResponse) => {
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
    transformResponse: (response: SupabaseNoteResponse) => {
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
    transformResponse: (response: SupabaseNoteResponse) => {
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
    invalidatesTags: (_result, _error, noteId) => [
      { type: "Note", id: "LIST" },
      { type: "Note", id: noteId },
    ],
  }),
});
