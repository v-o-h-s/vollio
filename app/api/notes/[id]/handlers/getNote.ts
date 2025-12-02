import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/supabase/supabase";
import { AuthError, DatabaseError } from "@/lib/utils/error-handling";
import { Logger } from "@/lib/utils/logger";
import { SupabaseNoteResponse } from "@/lib/types/editor";

export const getNoteHandler = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { userId } = await auth();

  if (!userId) {
    Logger.error("Unauthorized");
    throw AuthError.authenticationRequired();
  }

  const { id } = await params;
  const supabase = await getAuthenticatedSupabaseClient();

  const { data: noteData, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      Logger.error("Note not found");
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    Logger.error("Failed to fetch note:", error);
    throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(error.code);
  }

  // Transform database format to API format
  const note: SupabaseNoteResponse = {
    success: true,
    data: {
      id: noteData.id,
      userId: noteData.user_id,
      title: noteData.title,
      content: noteData.content,
      pdfAnnotationId: noteData.pdf_annotation_id,
      createdAt: noteData.created_at,
      updatedAt: noteData.updated_at,
      isDeleted: noteData.is_deleted,
      pdfId: noteData.pdf_id,
    },
  };

  return NextResponse.json(note);
};
