import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/lib/utils/logger";
import { DatabaseError } from "@/lib/error-handling";
import { createClient } from "@/lib/supabase/server";
import {
  fetchPDFById,
  deleteFromStorage,
  deletePDFFromDatabase,
} from "./common";

export async function handleDelete(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const supabase = await createClient();

  const { id } = await params;
  const pdfData = await fetchPDFById(supabase, id);

  if (!pdfData) {
    throw DatabaseError.notFound("PDF not found or access denied", {
      pdfId: id,
    });
  }

  const deletedPDF = await deletePDFFromDatabase(supabase, id);

  if (!deletedPDF) {
    throw DatabaseError.notFound("PDF not found or access denied", {
      pdfId: id,
    });
  }
  Logger.info("PDF deleted from database", { pdfId: id });

  await deleteFromStorage(supabase, pdfData.storage_path);

  Logger.info("PDF deleted from storage", { pdfId: id });

  return NextResponse.json({ success: true }, { status: 200 });
}
