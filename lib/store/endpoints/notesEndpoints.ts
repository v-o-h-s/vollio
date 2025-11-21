import type {
  CreateNoteRequest,
  Note,
  SupabaseNoteResponse,
  SupabaseNotesResponse,
  UpdateNoteRequest,
} from "../../types";
import type { ApiBuilder } from "./types";

export const notesEndpoints = (builder: ApiBuilder) => ({
  getNotes: builder.query<
    Note[],
    { pdfAnnotationId?: string; highlightId?: string }
  >({
    query: ({ pdfAnnotationId, highlightId } = {}) => ({
      url: "notes",
      params: {
        ...(pdfAnnotationId && { pdfAnnotationId }),
        ...(highlightId && { highlightId }),
      },
    }),
    transformResponse: (response: SupabaseNotesResponse) => {
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
      return response.data;
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
      return response.data;
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
      return response.data;
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

