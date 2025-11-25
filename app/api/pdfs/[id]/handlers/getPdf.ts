import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { generateSignedUrl } from "@/lib/utils/supabase-helpers";
import { Logger } from "@/lib/utils/logger";
import {
  DatabaseError,
  AuthError,
} from "@/lib/utils/error-handling";
import { ValidationError } from "@/lib/utils/error-handling/ValidationError";
import { SupabasePDFAccessResponse } from "@/lib/types/pdf";
import { fetchPDFById } from "./common";

export async function handleGet(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SupabasePDFAccessResponse>> {
  const { userId } = await auth();

  if (!userId) {
    Logger.error("User not authenticated", { userId });
    throw AuthError.authenticationRequired("User not authenticated");
  }

  const { id } = await params;
  if (!id) {
    throw ValidationError.General("PDF ID is required");
  }

  const supabaseClient = await getAuthenticatedSupabaseClient();
  const pdfData = await fetchPDFById(supabaseClient, id);

  if (!pdfData) {
    Logger.error("PDF not found or access denied", { userId, pdfId: id });
    throw DatabaseError.notFound("PDF not found or access denied", {
      userId,
      pdfId: id,
    });
  }

  const signedUrl = await generateSignedUrl(
    supabaseClient,
    pdfData.storage_path
  );

  Logger.info("PDF accessed successfully", { userId, pdfId: id });

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


