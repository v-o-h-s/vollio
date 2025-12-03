import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/supabase/supabase";
import { Logger } from "@/lib/utils/logger";
import { DatabaseError, AuthError } from "@/lib/error-handling";
import {
  fetchPDFById,
  deleteFromStorage,
  deletePDFFromDatabase,
} from "./common";

export async function handleDelete(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { userId } = await auth();

  if (!userId) {
    Logger.error("User not authenticated", { userId });
    throw AuthError.authenticationRequired("User not authenticated");
  }

  const { id } = await params;
  const supabaseClient = await getAuthenticatedSupabaseClient();
  const pdfData = await fetchPDFById(supabaseClient, id);

  if (!pdfData) {
    throw DatabaseError.notFound("PDF not found or access denied", {
      userId,
      pdfId: id,
    });
  }

  const deletedPDF = await deletePDFFromDatabase(supabaseClient, id);

  if (!deletedPDF) {
    throw DatabaseError.notFound("PDF not found or access denied", {
      userId,
      pdfId: id,
    });
  }
  Logger.info("PDF deleted from database", { userId, pdfId: id });

  await deleteFromStorage(supabaseClient, pdfData.storage_path);

  Logger.info("PDF deleted from storage", { userId, pdfId: id });

  return NextResponse.json({ success: true }, { status: 200 });
}
