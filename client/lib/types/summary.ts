// Summary type definitions

export interface Summary {
  id: string;
  userId: string;
  pdfId: string;
  mainPoints: string[];
  attributes: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupabaseSummaryResponse {
  id: string;
  user_id: string;
  pdf_id: string;
  main_points: string[];
  attributes: Record<string, any> | null;
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
    userId: data.user_id,
    pdfId: data.pdf_id,
    mainPoints: data.main_points || [],
    attributes: data.attributes,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};
