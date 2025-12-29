export interface CreateSummaryRequest {
  documentId: string;
  text?: string;
}

export interface UpdateSummaryRequest {
  id: string;
  text?: string;
}
