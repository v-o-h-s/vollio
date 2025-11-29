import type { ApiBuilder } from "./types";

export const highlightEndpoints = (builder: ApiBuilder) => ({
  getHighlights: builder.query<
    {
      highlights: Highlight[];
      total: number;
      pagination: {
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    },
    {
      pdfId?: string;
      noteId?: string;
      type?: "quick" | "comment" | "note";
      page?: number;
      limit?: number;
    }
  >({
    query: ({ pdfId, noteId, type, page = 1, limit = 50 }) => {
      const params = new URLSearchParams();
      if (pdfId) params.append("pdfId", pdfId);
      if (noteId) params.append("noteId", noteId);
      if (type) params.append("type", type);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      return `highlights?${params.toString()}`;
    },
    transformResponse: (response: any) => {
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch highlights");
      }
      return response.data;
    },
    providesTags: (result) => [
      { type: "Highlight", id: "LIST" },
      ...(result?.highlights || []).map((highlight) => ({
        type: "Highlight" as const,
        id: highlight.id,
      })),
    ],
  }),

  getPDFHighlights: builder.query<
    {
      highlights: Highlight[];
      total: number;
      pdfId: string;
      pagination: {
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    },
    {
      pdfId: string;
      type?: "quick" | "comment" | "note";
      page?: number;
      limit?: number;
    }
  >({
    query: ({ pdfId, type, page = 1, limit = 50 }) => {
      const params = new URLSearchParams();
      if (type) params.append("type", type);
      params.append("page", page.toString());
      params.append("limit", limit.toString());

      return `pdfs/${pdfId}/highlights?${params.toString()}`;
    },
    transformResponse: (response: any) => {
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch PDF highlights");
      }
      return response.data;
    },
    providesTags: (result, _error, { pdfId }) => [
      { type: "Highlight", id: "LIST" },
      { type: "PDF", id: pdfId },
      ...(result?.highlights || []).map((highlight) => ({
        type: "Highlight" as const,
        id: highlight.id,
      })),
    ],
  }),

  createHighlight: builder.mutation<
    { highlight: Highlight },
    {
      pdfId: string;
      noteId?: string;
      content: string;
      title?: string;
      color?: string;
      opacity?: number;
      pageNumber: number;
      type?: "quick" | "comment" | "note";
      textbounds: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
      }>;
    }
  >({
    query: (highlightData) => ({
      url: "highlights",
      method: "POST",
      body: highlightData,
    }),
    transformResponse: (response: any) => {
      if (!response.success) {
        throw new Error(response.error || "Failed to create highlight");
      }
      return response.data;
    },
    invalidatesTags: [
      { type: "Highlight", id: "LIST" },
      { type: "PDF", id: "LIST" },
    ],
  }),

  updateHighlight: builder.mutation<
    { highlight: Highlight },
    {
      id: string;
      updates: {
        content?: string;
        title?: string;
        color?: string;
        opacity?: number;
        type?: "quick" | "comment" | "note";
        noteId?: string;
        textbounds?: Array<{
          x: number;
          y: number;
          width: number;
          height: number;
        }>;
      };
    }
  >({
    query: ({ id, updates }) => ({
      url: `highlights/${id}`,
      method: "PUT",
      body: updates,
    }),
    transformResponse: (response: any) => {
      if (!response.success) {
        throw new Error(response.error || "Failed to update highlight");
      }
      return response.data;
    },
    invalidatesTags: (_result, _error, { id }) => [
      { type: "Highlight", id },
      { type: "Highlight", id: "LIST" },
    ],
  }),

  deleteHighlight: builder.mutation<void, string>({
    query: (id) => ({
      url: `highlights/${id}`,
      method: "DELETE",
    }),
    transformResponse: (response: any) => {
      if (!response.success) {
        throw new Error(response.error || "Failed to delete highlight");
      }
    },
    invalidatesTags: (_result, _error, id) => [
      { type: "Highlight", id },
      { type: "Highlight", id: "LIST" },
    ],
  }),
});

