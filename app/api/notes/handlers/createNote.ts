import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Logger } from "@/lib/utils/logger";
import { getAuthenticatedSupabaseClient } from "@/supabase/supabase";
import { NextResponse } from "next/server";
import { SupabaseNoteResponse } from "@/lib/types/editor";
import { DatabaseError } from "@/lib/utils/error-handling";

import { CreateNoteDto } from "@/lib/dto/createNoteDto";

export const createNoteHandler = async (
  request: NextRequest,
  data: CreateNoteDto
) => {
  Logger.info("📝 Creating new note");

  const { userId } = await auth();

  if (!userId) {
    Logger.warn("🔐 Unauthorized access attempt to create note");
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  Logger.info(`👤 Creating note for user: ${userId}`);

  const { title, content, pdfId } = data;

  const supabase = await getAuthenticatedSupabaseClient();

  const { data: noteData, error } = await supabase
    .from("notes")
    .insert({
      title,
      content,
      user_id: userId,
      pdf_id: pdfId,
    })
    .select()
    .single();

  if (error) {
    Logger.error(`❌ Database error creating note for user ${userId}`, error);
    throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(error.code);
  }

  Logger.success(`📝 Note created successfully`, {
    noteId: noteData.id,
    title,
    userId,
  });

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

  return NextResponse.json(note, { status: 201 });
};
