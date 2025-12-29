// Summary type definitions

export interface Summary {
  id: string;
  documentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupabaseSummaryResponse {
  id: string;
  document_id: string;
  created_at: string;
  updated_at: string;
}

export interface SummaryServerResponse {
  success: boolean;
  status: number;
  data: Summary | null;
  error: string | null;
}

// Mapper function to convert Supabase response to Summary
export const mapSupabaseSummaryResponseToSummary = (
  data: SupabaseSummaryResponse
): Summary => {
  return {
    id: data.id,
    documentId: data.document_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};
