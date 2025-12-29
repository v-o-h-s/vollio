export interface CreateSummaryRequest {
  documentId: string;
  text?: string;
}

export interface UpdateSummaryRequest {
  id: string;
  text?: string;
}

export type CreateSummaryDTO = CreateSummaryRequest;
export type UpdateSummaryDTO = UpdateSummaryRequest;

export interface GenerateSummaryDTO {
  documentId: string;
}
