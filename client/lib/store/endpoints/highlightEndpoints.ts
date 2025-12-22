import { ApiBuilder } from "./types";
import {
  GetHighlightsResponse,
  CreateHighlightResponse,
  UpdateHighlightResponse,
  DeleteHighlightResponse,
  HighlightData,
} from "@shared/types/responses/highlightRoutes";
import {
  CreateHighlightDTO,
  UpdateHighlightDTO,
} from "@shared/validation/highlightSchemas";
import { ServerSuccessResponse } from "@shared/types/responses/general";

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

  getPDFHighlights: builder.query<HighlightData[], string>({
    query: (pdfId) => `highlights?documentId=${pdfId}`,
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
});
