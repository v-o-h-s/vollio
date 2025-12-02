import { Logger } from "@/lib/utils/logger";
import { STORAGE_CONFIG } from "@/supabase/supabase";
import { DatabaseError, StorageError } from "@/lib/utils/error-handling";

export async function fetchPDFById(supabaseClient: any, pdfId: string) {
  const { data, error } = await supabaseClient
    .from("pdfs")
    .select("*")
    .eq("id", pdfId)
    .single();

  if (error) {
    Logger.error("Database query failed for fetchPDFById", { error });
    throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(
      error.code,
      `Failed to fetch PDF by ID: ${error.message}`,
      { operation: "fetch_pdf_by_id" },
      error
    );
  }

  return data;
}

export async function deleteFromStorage(
  supabaseClient: any,
  storagePath: string
): Promise<void> {
  const { error } = await supabaseClient.storage
    .from(STORAGE_CONFIG.BUCKET_NAME)
    .remove([storagePath]);

  if (error) {
    Logger.error("Failed to delete file from storage", { error });
    throw StorageError.deleteFailed(
      `Failed to delete file from storage: ${error.message}`,
      { operation: "delete_from_storage", storagePath },
      error
    );
  }
}

export async function deletePDFFromDatabase(
  supabaseClient: any,
  pdfId: string
) {
  const { data, error } = await supabaseClient
    .from("pdfs")
    .delete()
    .eq("id", pdfId)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }

    Logger.error("Failed to delete PDF from database", { error });
    throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(
      error.code,
      `Failed to delete PDF from database: ${error.message}`,
      { operation: "delete_pdf_from_database", pdfId },
      error
    );
  }

  return data;
}
