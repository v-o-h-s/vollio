import {
  HighlightwithDetails,
  HighlightServerResponse,
} from "@/lib/types/highlight";
import { CreateHighlightDto } from "@/lib/dto/createHighLightDto";
import { ApiBuilder } from "./types";

export const highlightEndpoints = (builder: ApiBuilder) => ({
  getHighlights: builder.query<HighlightwithDetails[], void>({
    query: () => "highlights",
    transformResponse: (response: { data: HighlightwithDetails[] }) =>
      response.data,
    providesTags: (result) =>
      result
        ? [
            ...result.map(({ id }) => ({ type: "Highlight" as const, id })),
            { type: "Highlight", id: "LIST" },
          ]
        : [{ type: "Highlight", id: "LIST" }],
  }),
  getPDFHighlights: builder.query<HighlightwithDetails[], string>({
    query: (pdfId) => `highlights?pdfId=${pdfId}`,
    transformResponse: (response: { data: HighlightwithDetails[] }) =>
      response.data,
    providesTags: (result) =>
      result
        ? [
            ...result.map(({ id }) => ({ type: "Highlight" as const, id })),
            { type: "Highlight", id: "LIST" },
          ]
        : [{ type: "Highlight", id: "LIST" }],
  }),
  createHighlight: builder.mutation<HighlightwithDetails, CreateHighlightDto>({
    query: (highlight) => ({
      url: "highlights",
      method: "POST",
      body: highlight,
    }),
    transformResponse: (response: HighlightServerResponse) => response.data,
    invalidatesTags: [{ type: "Highlight", id: "LIST" }],
  }),
  updateHighlight: builder.mutation<
    HighlightwithDetails,
    { id: string; highlight: Partial<CreateHighlightDto> }
  >({
    query: ({ id, highlight }) => ({
      url: `highlights/${id}`,
      method: "PATCH",
      body: highlight,
    }),
    transformResponse: (response: HighlightServerResponse) => response.data,
    invalidatesTags: (result, error, { id }) => [
      { type: "Highlight", id },
      { type: "Highlight", id: "LIST" },
    ],
  }),
  deleteHighlight: builder.mutation<{ success: boolean; id: string }, string>({
    query: (id) => ({
      url: `highlights/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: (result, error, id) => [
      { type: "Highlight", id },
      { type: "Highlight", id: "LIST" },
    ],
  }),
});
