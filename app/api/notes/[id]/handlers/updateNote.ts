import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { AuthError } from "@/lib/utils/error-handling";
import { Logger } from "@/lib/utils/logger";

export const updateNoteHandler = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { userId } = await auth();

  if (!userId) {
    Logger.error("Unauthorized");
    throw AuthError.authenticationRequired();
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

  // Validate content is a proper TipTap document structure
  if (typeof content !== "object" || !content.type) {
    return NextResponse.json(
      {
        error: "Content must be a valid TipTap document with a type property",
      },
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
};
