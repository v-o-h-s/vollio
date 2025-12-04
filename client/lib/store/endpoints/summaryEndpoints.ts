import { Summary, SummaryServerResponse } from "@/lib/types/summary";
import { CreateSummaryDto } from "@/lib/dto/createSummaryDto";
import { UpdateSummaryDto } from "@/lib/dto/updateSummaryDto";
import { ApiBuilder } from "./types";

export const summaryEndpoints = (builder: ApiBuilder) => ({
  getSummaryByPdfId: builder.query<Summary | null, string>({
    query: (pdfId) => `summaries?pdfId=${pdfId}`,
    transformResponse: (response: SummaryServerResponse) => response.data,
    providesTags: (result) =>
      result ? [{ type: "Summary" as const, id: result.id }] : [],
  }),
  createOrUpdateSummary: builder.mutation<Summary | null, CreateSummaryDto>({
    query: (summary) => ({
      url: "summaries",
      method: "POST",
      body: summary,
    }),
    transformResponse: (response: SummaryServerResponse) => response.data,
    invalidatesTags: (result) =>
      result ? [{ type: "Summary", id: result.id }] : [],
  }),
  updateSummary: builder.mutation<
    Summary | null,
    { id: string; summary: UpdateSummaryDto }
  >({
    query: ({ id, summary }) => ({
      url: `summaries/${id}`,
      method: "PATCH",
      body: summary,
    }),
    transformResponse: (response: SummaryServerResponse) => response.data,
    invalidatesTags: (result) =>
      result ? [{ type: "Summary", id: result.id }] : [],
  }),
  deleteSummary: builder.mutation<{ success: boolean }, string>({
    query: (id) => ({
      url: `summaries/${id}`,
      method: "DELETE",
    }),
    invalidatesTags: (result, error, id) => [{ type: "Summary", id }],
  }),
});
