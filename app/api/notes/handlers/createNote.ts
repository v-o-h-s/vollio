import { NextRequest } from "next/server";

import { Logger } from "@/lib/utils/logger";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { SupabaseNoteResponse } from "@/lib/types/editor";
import { DatabaseError } from "@/lib/error-handling";

import { CreateNoteDto } from "@/lib/dto/createNoteDto";

export const createNoteHandler = async (
  request: NextRequest,
  data: CreateNoteDto
) => {
  Logger.info("📝 Creating new note");

  const { title, content, pdfId } = data;

  const supabase = await createClient();

  Logger.info(`👤 Creating note for user`);

  const { data: noteData, error } = await supabase
    .from("notes")
    .insert({
      title,
      content,
      pdf_id: pdfId,
      // user_id is automatically set by database trigger
    })
    .select()
    .single();

  if (error) {
    Logger.error(`❌ Database error creating note for user`, error);
    throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(error.code);
  }

  Logger.success(`📝 Note created successfully`, {
    noteId: noteData.id,
    title,
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
