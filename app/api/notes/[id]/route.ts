import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { withErrorHandling } from "@/lib/utils/server-error-handling";

// GET /api/notes/[id] - Get a specific note
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    console.error("Failed to fetch note:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
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

  return NextResponse.json({ success: true, data: note });
});

// PUT /api/notes/[id] - Update a specific note
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, content } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 }
    );
  }

  const supabase = await getAuthenticatedSupabaseClient();
  
  const { data: noteData, error } = await supabase
    .from("notes")
    .update({
      title,
      content,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }
    console.error("Failed to update note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
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

  return NextResponse.json({ success: true, data: note });
});

// DELETE /api/notes/[id] - Delete a specific note
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await getAuthenticatedSupabaseClient();
  
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
});