import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { withErrorHandling } from "@/lib/utils/server-error-handling";
import { NoteInsert, NoteUpdate } from "@/lib/types/database";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getAuthenticatedSupabaseClient();

  let query = (await supabase)
    .from("notes")
    .select("*")
    .eq("is_deleted", false)
    .order("updated_at", { ascending: false });

  const { data: notes, error } = await query;

  if (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: notes,
  });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, content } = body;

  // Validate required fields
  if (!content) {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 }
    );
  }

  // Validate TipTap JSONContent structure
  if (typeof content !== "object" || !content.type) {
    return NextResponse.json(
      { error: "Invalid content format - must be TipTap JSONContent" },
      { status: 400 }
    );
  }

  const supabase = getAuthenticatedSupabaseClient();

  const noteData: NoteInsert = {
    user_id: userId,
    title: title || "Untitled",
    content,
  };

  const { data: note, error } = await (await supabase)
    .from("notes")
    .insert(noteData)
    .select()
    .single();

  if (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: note,
    },
    { status: 201 }
  );
});