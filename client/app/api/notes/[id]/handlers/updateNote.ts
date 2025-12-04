import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AuthError } from "@/lib/error-handling";
import { Logger } from "@/lib/utils/logger";

import { UpdateNoteDto } from "@/lib/dto/updateNoteDto";

export const updateNoteHandler = async (
  request: NextRequest,
  data: UpdateNoteDto,
  { params }: { params: Promise<{ id: string }> }
) => {
  const supabase = await createClient();

  const { id } = await params;
  const { title, content } = data;

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
