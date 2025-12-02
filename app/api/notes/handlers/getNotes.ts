import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/supabase/supabase";
import { Logger } from "@/lib/utils/logger";
import {
  SupabaseNotesListResponse,
  SupabaseSingleNoteFromListRepsonse,
} from "@/lib/types/editor";

export const getNotesHandler = async (request: NextRequest) => {
  const { searchParams } = request.nextUrl;
  const pdfId = searchParams.get("pdfId");

  Logger.info("📝 Fetching all notes");

  const { userId } = await auth();

  if (!userId) {
    Logger.warn("🔐 Unauthorized access attempt to fetch notes");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  Logger.info(`👤 Fetching notes for user: ${userId}`);

  const supabase = await getAuthenticatedSupabaseClient();

  Logger.info("💾 Querying notes from database");
  let query = supabase.from("notes").select("*");

  if (pdfId) {
    query = query.eq("pdf_id", pdfId);
  }

  const { data: notesData, error } = await query.order("updated_at", {
    ascending: false,
  });

  if (error) {
    Logger.error(`❌ Database error fetching notes for user ${userId}`, error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }

  Logger.info(
    `✅ Retrieved ${notesData?.length || 0} notes for user ${userId}`
  );

  // Transform database format to API format
  const notes: SupabaseSingleNoteFromListRepsonse[] = notesData.map(
    (note: any) => ({
      id: note.id,
      title: note.title,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
      isDeleted: note.is_deleted,
      pdfId: note.pdf_id,
    })
  );

  // Transform database format to API format
  const response: SupabaseNotesListResponse = {
    success: true,
    data: notes,
  };

  Logger.success(`📝 Successfully returned ${notes.length} notes`);
  return NextResponse.json(response);
};
