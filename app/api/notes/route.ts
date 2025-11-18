import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { withErrorHandling } from "@/lib/wrappers/withErrorHandling";
import { Logger } from "@/lib/utils/logger";

// GET /api/notes - List all notes for the authenticated user
export const GET = withErrorHandling(async (request: NextRequest) => {
  Logger.info("📝 Fetching all notes");

  const { userId } = await auth();

  if (!userId) {
    Logger.warn("🔐 Unauthorized access attempt to fetch notes");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  Logger.info(`👤 Fetching notes for user: ${userId}`);

  const supabase = await getAuthenticatedSupabaseClient();

  Logger.info("💾 Querying notes from database");
  const { data: notesData, error } = await supabase
    .from("notes")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    Logger.error(`❌ Database error fetching notes for user ${userId}`, error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }

  Logger.info(`✅ Retrieved ${notesData?.length || 0} notes for user ${userId}`);

  // Transform database format to API format
  const notes = notesData.map((note: any) => ({
    id: note.id,
    userId: note.user_id,
    title: note.title,
    content: note.content,
    pdfAnnotationId: note.pdf_annotation_id,
    createdAt: note.created_at,
    updatedAt: note.updated_at,
    isDeleted: note.is_deleted,
  }));

  Logger.success(`📝 Successfully returned ${notes.length} notes`);
  return NextResponse.json({ success: true, data: notes });
});

// POST /api/notes - Create a new note
export const POST = withErrorHandling(async (request: NextRequest) => {
  Logger.info("📝 Creating new note");

  const { userId } = await auth();

  if (!userId) {
    Logger.warn("🔐 Unauthorized access attempt to create note");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  Logger.info(`👤 Creating note for user: ${userId}`);

  const body = await request.json();
  const { title, content } = body;

  Logger.info(`📋 Validating note data`, { title, hasContent: !!content });

  if (!title || !content) {
    Logger.warn(`❌ Validation failed: missing required fields for user ${userId}`);
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 }
    );
  }

  // Validate content is a proper TipTap document structure
  if (typeof content !== 'object' || !content.type) {
    Logger.warn(`❌ Validation failed: invalid TipTap document structure for user ${userId}`);
    return NextResponse.json(
      { error: "Content must be a valid TipTap document with a type property" },
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
      { error: "Failed to create note" },
      { status: 500 }
    );
  }

  Logger.success(`📝 Note created successfully`, { noteId: noteData.id, title, userId });

  // Transform database format to API format
  const note = {
    id: noteData.id,
    userId: noteData.user_id,
    title: noteData.title,
    content: noteData.content,
    pdfAnnotationId: noteData.pdf_annotation_id,
    createdAt: noteData.created_at,
    updatedAt: noteData.updated_at,
    isDeleted: noteData.is_deleted,
  };

  return NextResponse.json({ success: true, data: note }, { status: 201 });
});