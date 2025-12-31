import { ApiBuilder } from "./types";
import {
  GetHighlightsResponse,
  CreateHighlightResponse,
  UpdateHighlightResponse,
  DeleteHighlightResponse,
  HighlightData,
} from "@vollio/shared";
import {
  CreateHighlightDTO,
  UpdateHighlightDTO,
} from "@vollio/shared";
import { ServerSuccessResponse } from "@vollio/shared";

export const highlightEndpoints = (builder: ApiBuilder) => ({
  getHighlights: builder.query<HighlightData[], void>({
    query: () => "highlights/",
    transformResponse: (response: GetHighlightsResponse) => response.data || [],
    providesTags: (result) =>
      result
        ? [
            ...result.map(({ id }) => ({ type: "Highlight" as const, id })),
            { type: "Highlight", id: "LIST" },
          ]
        : [{ type: "Highlight", id: "LIST" }],
  }),

  getDocumentHighlights: builder.query<HighlightData[], string>({
    query: (documentId) => `highlights?documentId=${documentId}`,
    transformResponse: (response: GetHighlightsResponse) => response.data || [],
    providesTags: (result) =>
      result
        ? [
            ...result.map(({ id }) => ({ type: "Highlight" as const, id })),
            { type: "Highlight", id: "LIST" },
          ]
        : [{ type: "Highlight", id: "LIST" }],
  }),

  createHighlight: builder.mutation<null, CreateHighlightDTO>({
    query: (highlight) => ({
      url: "highlights/",
      method: "POST",
      body: highlight,
    }),
    transformResponse: (response: CreateHighlightResponse) => response.data,
    invalidatesTags: [{ type: "Highlight", id: "LIST" }],
  }),

  updateHighlight: builder.mutation<
    null,
    { id: string; highlight: UpdateHighlightDTO }
  >({
    query: ({ id, highlight }) => ({
      url: `highlights/${id}`,
      method: "PATCH",
      body: highlight,
    }),
    transformResponse: (response: UpdateHighlightResponse) => response.data,
    invalidatesTags: (_result, _error, { id }) => [
      { type: "Highlight", id },
      { type: "Highlight", id: "LIST" },
    ],
  }),

  deleteHighlight: builder.mutation<null, string>({
    query: (id) => ({
      url: `highlights/${id}`,
      method: "DELETE",
    }),
    transformResponse: (response: DeleteHighlightResponse) => response.data,
    invalidatesTags: (_result, _error, id) => [
      { type: "Highlight", id },
      { type: "Highlight", id: "LIST" },
    ],
  }),

  countHighlightsByTag: builder.query<{ count: number }, string>({
    query: (tagName) => `highlights/tags/${encodeURIComponent(tagName)}/count`,
    transformResponse: (response: ServerSuccessResponse<{ count: number }>) => response.data,
  }),

  deleteHighlightsByTag: builder.mutation<null, string>({
    query: (tagName) => ({
      url: `highlights/tags/${encodeURIComponent(tagName)}`,
      method: "DELETE",
    }),
    transformResponse: (response: ServerSuccessResponse<null>) => response.data,
    invalidatesTags: [{ type: "Highlight", id: "LIST" }],
  }),
});
