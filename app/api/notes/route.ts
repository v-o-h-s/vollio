import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { withErrorHandling } from "@/lib/utils/error-handling/errorHandling";

// GET /api/notes - List all notes for the authenticated user
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase =await getAuthenticatedSupabaseClient();
  
  const { data: notesData, error } = await supabase
    .from("notes")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }

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

  return NextResponse.json({ success: true, data: notes });
});

// POST /api/notes - Create a new note
export const POST = withErrorHandling(async (request: NextRequest) => {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, content } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 }
    );
  }

  // Validate content is a proper TipTap document structure
  if (typeof content !== 'object' || !content.type) {
    return NextResponse.json(
      { error: "Content must be a valid TipTap document with a type property" },
      { status: 400 }
    );
  }

  const supabase =await getAuthenticatedSupabaseClient();
  
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
    console.error("Failed to create note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }

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