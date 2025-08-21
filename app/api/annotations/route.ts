import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/utils/supabase-helpers";
import { withErrorHandling } from "@/lib/utils/server-error-handling";
import { AnnotationInsert } from "@/lib/types/database";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pdfId = searchParams.get("pdfId");
  const page = searchParams.get("page");

  const supabase = getAuthenticatedSupabaseClient();
  let query = supabase
    .from("annotations")
    .select("*")
    .order("created_at", { ascending: false });

  // Filter by PDF ID if specified
  if (pdfId) {
    query = query.eq("pdf_id", pdfId);
  }

  // Filter by page number if specified
  if (page) {
    const pageNumber = parseInt(page, 10);
    if (!isNaN(pageNumber)) {
      query = query.eq("page_number", pageNumber);
    }
  }

  const { data: annotations, error } = await query;

  if (error) {
    console.error("Error fetching annotations:", error);
    return NextResponse.json(
      { error: "Failed to fetch annotations" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: annotations,
  });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { pdfId, pageNumber, selectedText, noteContent, coordinates } = body;

  // Validate required fields
  if (
    !pdfId ||
    !pageNumber ||
    !selectedText ||
    !noteContent ||
    !coordinates
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Validate coordinates structure
  if (
    typeof coordinates.x !== "number" ||
    typeof coordinates.y !== "number" ||
    typeof coordinates.width !== "number" ||
    typeof coordinates.height !== "number"
  ) {
    return NextResponse.json(
      { error: "Invalid coordinates format" },
      { status: 400 }
    );
  }

  const supabase = getAuthenticatedSupabaseClient();

  const annotationData: AnnotationInsert = {
    user_id: userId,
    pdf_id: pdfId,
    page_number: parseInt(pageNumber, 10),
    selected_text: selectedText,
    note_content: noteContent,
    coordinates,
  };

  const { data: annotation, error } = await supabase
    .from("annotations")
    .insert(annotationData)
    .select()
    .single();

  if (error) {
    console.error("Error creating annotation:", error);
    return NextResponse.json(
      { error: "Failed to create annotation" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: annotation,
    },
    { status: 201 }
  );
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, noteContent } = body;

  if (!id) {
    return NextResponse.json(
      { error: "Annotation ID is required" },
      { status: 400 }
    );
  }

  if (!noteContent) {
    return NextResponse.json(
      { error: "Note content is required" },
      { status: 400 }
    );
  }

  const supabase = getAuthenticatedSupabaseClient();

  const { data: annotation, error } = await supabase
    .from("annotations")
    .update({ note_content: noteContent })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Annotation not found" },
        { status: 404 }
      );
    }
    console.error("Error updating annotation:", error);
    return NextResponse.json(
      { error: "Failed to update annotation" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: annotation,
  });
});

export const DELETE = withErrorHandling(async (request: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Annotation ID is required" },
      { status: 400 }
    );
  }

  const supabase = getAuthenticatedSupabaseClient();

  const { data: annotation, error } = await supabase
    .from("annotations")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json(
        { error: "Annotation not found" },
        { status: 404 }
      );
    }
    console.error("Error deleting annotation:", error);
    return NextResponse.json(
      { error: "Failed to delete annotation" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: annotation,
  });
});
