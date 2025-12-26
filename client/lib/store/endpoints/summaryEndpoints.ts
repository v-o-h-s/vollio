import { ApiBuilder } from "./types";
import { SummaryData } from "@vollio/shared";
import {
  CreateSummaryDTO,
  UpdateSummaryDTO,
} from "@vollio/shared";
import { ServerSuccessResponse } from "@vollio/shared";

export const summaryEndpoints = (builder: ApiBuilder) => ({
  getSummariesByDocumentId: builder.query<SummaryData[], string>({
    query: (documentId) => `summaries?documentId=${documentId}`,
    transformResponse: (response: ServerSuccessResponse<SummaryData[]>) =>
      response.data || [],
    providesTags: (result) =>
      result
        ? [
            ...result.map(({ id }) => ({ type: "Summary" as const, id })),
            { type: "Summary", id: "LIST" },
          ]
        : [{ type: "Summary", id: "LIST" }],
  }),

  getSummaryById: builder.query<SummaryData, string>({
    query: (id) => `summaries/${id}`,
    transformResponse: (response: ServerSuccessResponse<SummaryData>) => {
      if (!response.data) throw new Error("Summary not found");
      return response.data;
    },
    providesTags: (result) =>
      result ? [{ type: "Summary", id: result.id }] : [],
  }),

  createSummary: builder.mutation<SummaryData, CreateSummaryDTO>({
    query: (data) => ({
      url: "summaries",
      method: "POST",
      body: data,
    }),
    transformResponse: (response: ServerSuccessResponse<SummaryData>) => {
      if (!response.data) throw new Error("Failed to create summary");
      return response.data;
    },
    invalidatesTags: [{ type: "Summary", id: "LIST" }],
  }),

  updateSummary: builder.mutation<SummaryData, UpdateSummaryDTO>({
    query: (data) => ({
      url: "summaries",
      method: "PATCH",
      body: data,
    }),
    transformResponse: (response: ServerSuccessResponse<SummaryData>) => {
      if (!response.data) throw new Error("Failed to update summary");
      return response.data;
    },
    invalidatesTags: (result) =>
      result
        ? [
            { type: "Summary", id: result.id },
            { type: "Summary", id: "LIST" },
          ]
        : [{ type: "Summary", id: "LIST" }],
  }),

  deleteSummary: builder.mutation<void, string>({
    query: (id) => ({
      url: "summaries",
      method: "DELETE",
      body: { id },
    }),
    invalidatesTags: (_result, _error, id) => [
      { type: "Summary", id },
      { type: "Summary", id: "LIST" },
    ],
  }),
});
