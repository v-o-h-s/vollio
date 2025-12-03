import { DatabaseError } from "@/lib/error-handling";

/**
 * Moves a PDF to a different folder
 */
export async function movePdfHandler(
  supabaseClient: any,
  userId: string,
  pdfId: string,
  folderId: string | null
): Promise<any> {
  // Validate PDF exists and belongs to user
  const { data: existingPDF, error: fetchError } = await supabaseClient
    .from("pdfs")
    .select("*")
    .eq("id", pdfId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !existingPDF) {
    throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(
      fetchError?.code,
      "PDF not found or access denied",
      { operation: "validate_pdf", userId, pdfId },
      fetchError
    );
  }

  // Validate folder exists and belongs to user if folderId is provided
  if (folderId) {
    const { data: targetFolder, error: folderError } = await supabaseClient
      .from("folders")
      .select("id")
      .eq("id", folderId)
      .eq("user_id", userId)
      .single();

    if (folderError || !targetFolder) {
      throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(
        folderError?.code,
        "Target folder not found or access denied",
        { operation: "validate_folder", userId, folderId },
        folderError
      );
    }
  }

  // Update the PDF's folder
  const { data, error } = await supabaseClient
    .from("pdfs")
    .update({ folder_id: folderId })
    .eq("id", pdfId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(
      error?.code,
      `Failed to move PDF: ${error.message}`,
      {
        operation: "move_pdf",
        userId,
        pdfId,
        folderId,
      },
      error
    );
  }

  return data;
}
