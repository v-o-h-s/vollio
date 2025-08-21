import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/utils/supabase-helpers";
import { withErrorHandling } from "@/lib/utils/server-error-handling";
import { NoteUpdate } from "@/lib/types/database";

interface RouteParams {
  params: {
    id: string;
  };
}

export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Note ID is required" },
      { status: 400 }
    );
  }

  const supabase = getAuthenticatedSupabaseClient();

  const { data: note, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }
    console.error("Error fetching note:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: note,
  });
});

export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Note ID is required" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { title, content } = body;

  // Validate that at least one field is being updated
  if (!title && !content) {
    return NextResponse.json(
      { error: "At least one field (title or content) must be provided" },
      { status: 400 }
    );
  }

  // Validate TipTap JSONContent structure if content is provided
  if (content && (typeof content !== "object" || !content.type)) {
    return NextResponse.json(
      { error: "Invalid content format - must be TipTap JSONContent" },
      { status: 400 }
    );
  }

  const supabase = getAuthenticatedSupabaseClient();

  const updateData: NoteUpdate = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;

  const { data: note, error } = await supabase
    .from("notes")
    .update(updateData)
    .eq("id", id)
    .eq("is_deleted", false)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }
    console.error("Error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: note,
  });
});

export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Note ID is required" },
      { status: 400 }
    );
  }

  const supabase = getAuthenticatedSupabaseClient();

  // Soft delete by setting is_deleted to true
  const { data: note, error } = await supabase
    .from("notes")
    .update({ is_deleted: true })
    .eq("id", id)
    .eq("is_deleted", false)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Note not found" },
        { status: 404 }
      );
    }
    console.error("Error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: note,
  });
});