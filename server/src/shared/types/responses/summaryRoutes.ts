import { ServerSuccessResponse } from "./general";

export interface SummaryData {
  id: string;
  documentId: string;
  mainPoints: string[];
  text: string | null;
}

// GET /api/v1/summaries/:id
export type GetSummaryByIdResponse = ServerSuccessResponse<SummaryData>;

// GET /api/v1/summaries?documentId={documentId}
export type GetSummariesByDocumentIdResponse = ServerSuccessResponse<
  SummaryData[]
>;

// PATCH /api/v1/summaries/:id/main-points
export type UpdateSummaryMainPointsResponse = ServerSuccessResponse<null>;

// PATCH /api/v1/summaries/:id/text
export type UpdateSummaryTextResponse = ServerSuccessResponse<null>;

// DELETE /api/v1/summaries/:id
export type DeleteSummaryResponse = ServerSuccessResponse<null>;
