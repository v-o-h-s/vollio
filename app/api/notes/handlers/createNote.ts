import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Logger } from "@/lib/utils/logger";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";
import { success } from "zod";
import { SupabaseNoteResponse } from "@/lib/types/editor";

export const createNoteHandler = async (request: NextRequest) => {
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

  const body = await request.json();
  const { title, content } = body;

  Logger.info(`📋 Validating note data`, { title, hasContent: !!content });

  if (!title || !content) {
    Logger.warn(
      `❌ Validation failed: missing required fields for user ${userId}`
    );
    return NextResponse.json(
      { success: false, error: "Title and content are required" },
      { status: 400 }
    );
  }

  // Validate content is a proper TipTap document structure
  if (typeof content !== "object" || !content.type) {
    Logger.warn(
      `❌ Validation failed: invalid TipTap document structure for user ${userId}`
    );
    return NextResponse.json(
      {
        success: false,
        error: "Content must be a valid TipTap document with a type property",
      },
      { status: 400 }
    );
  }

  Logger.info(`✅ Validation passed, inserting note into database`, { title });

  const supabase = await getAuthenticatedSupabaseClient();

  const { data: noteData, error } = await supabase
    .from("notes")
    .insert({
      title,
      content,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    Logger.error(`❌ Database error creating note for user ${userId}`, error);
    return NextResponse.json(
      { success: false, error: "Failed to create note" },
      { status: 500 }
    );
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
