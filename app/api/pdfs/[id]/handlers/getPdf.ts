import { NextRequest, NextResponse } from "next/server";
import { generateSignedUrl } from "@/lib/utils/supabase-helpers";
import { Logger } from "@/lib/utils/logger";
import { DatabaseError } from "@/lib/error-handling";
import { ValidationError } from "@/lib/error-handling/ValidationError";
import { SupabasePDFAccessResponse } from "@/lib/types/pdf";
import { fetchPDFById } from "./common";
import { createClient } from "@/lib/supabase/server";

export async function handleGet(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SupabasePDFAccessResponse>> {
  const supabase = await createClient();
  const { id } = await params;
  if (!id) {
    throw ValidationError.General("PDF ID is required");
  }

  const pdfData = await fetchPDFById(supabase, id);

  if (!pdfData) {
    Logger.error("PDF not found or access denied", { pdfId: id });
    throw DatabaseError.notFound("PDF not found or access denied", {
      pdfId: id,
    });
  }

  const signedUrl = await generateSignedUrl(supabase, pdfData.storage_path);

  Logger.info("PDF accessed successfully", { pdfId: id });

  const response: SupabasePDFAccessResponse = {
    success: true,
    data: {
      id: pdfData.id,
      filename: pdfData.filename,
      fileUrl: signedUrl,
      fileSize: pdfData.file_size,
      mimeType: pdfData.mime_type,
      uploadedAt: pdfData.uploaded_at,
    },
  };

  return NextResponse.json(response, { status: 200 });
}
