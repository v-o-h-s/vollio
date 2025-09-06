import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { withErrorHandling } from "@/lib/utils/server-error-handling";
import { z } from "zod";
import { Content } from "next/font/google";

// Validation schema for annotation creation
const createAnnotationSchema = z.object({
  pdfId: z.string().uuid("Invalid PDF ID format"),
  noteId: z.string().uuid("Invalid note ID format"),
  selectedText: z
    .string()
    .min(1, "Selected text is required")
    .max(5000, "Selected text too long"),
  pageNumber: z.number().int().min(0, "Page number must be non-negative"),
  coordinates: z.object({
    x: z.number().min(0, "X coordinate must be non-negative"),
    y: z.number().min(0, "Y coordinate must be non-negative"),
    width: z.number().min(0, "Width must be positive"),
    height: z.number().min(0, "Height must be positive"),
  }),
  noteContent: z.string().optional(),// will be modified later
});

/**
 * POST /api/annotations
 * Creates a new annotation linking a note to a PDF text selection
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const body = await request.json();

  // Validate request data
  const validationResult = createAnnotationSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: "Invalid annotation data",
        details: validationResult.error.issues,
      },
      { status: 400 }
    );
  }

  const { pdfId, noteId, selectedText, pageNumber, coordinates, noteContent } =
    validationResult.data;

  const supabase = await getAuthenticatedSupabaseClient();

  try {
    // Verify that the PDF belongs to the user
    const { data: pdfData, error: pdfError } = await supabase
      .from("pdfs")
      .select("id, user_id")
      .eq("id", pdfId)
      .eq("user_id", userId)
      .single();

    if (pdfError || !pdfData) {
      return NextResponse.json(
        { error: "PDF not found or access denied" },
        { status: 404 }
      );
    }

    // Verify that the note belongs to the user
    const { data: noteData, error: noteError } = await supabase
      .from("notes")
      .select("id, user_id")
      .eq("id", noteId)
      .eq("user_id", userId)
      .single();

    if (noteError || !noteData) {
      return NextResponse.json(
        { error: "Note not found or access denied" },
        { status: 404 }
      );
    }

    // Create the annotation
    const { data: annotation, error: createError } = await supabase
      .from("annotations")
      .insert({
        pdf_id: pdfId,
        note_id: noteId,
        user_id: userId,
        selected_text: selectedText,
        page_number: pageNumber,
        coordinates: coordinates,
        content: noteContent || selectedText, // Use noteContent if provided, otherwise fall back to selectedText
      })
      .select(
        `
        id,
        pdf_id,
        note_id,
        user_id,
        selected_text,
        page_number,
        coordinates,
        content,
        created_at,
        updated_at
      `
      )
      .single();

    if (createError) {
      console.error("Failed to create annotation:", createError);
      return NextResponse.json(
        { error: "Failed to create annotation", details: createError.message },
        { status: 500 }
      );
    }

    // Transform database row to application format
    const annotationResponse = {
      id: annotation.id,
      pdfId: annotation.pdf_id,
      noteId: annotation.note_id,
      userId: annotation.user_id,
      selectedText: annotation.selected_text,
      pageNumber: annotation.page_number,
      coordinates: annotation.coordinates,
      content: annotation.content,
      createdAt: annotation.created_at,
      updatedAt: annotation.updated_at,
    };

    console.log("Annotation created successfully:", annotationResponse); // will be deleted

    return NextResponse.json({
      success: true,
      data: annotationResponse,
    });
  } catch (error) {
    console.error("Annotation creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

/**
 * GET /api/annotations
 * Retrieves annotations for the authenticated user
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const pdfId = searchParams.get("pdfId");

  const supabase = await getAuthenticatedSupabaseClient();

  try {
    let query = supabase
      .from("annotations")
      .select(
        `
        id,
        pdf_id,
        note_id,
        user_id,
        selected_text,
        page_number,
        coordinates,
        content,
        created_at,
        updated_at
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Filter by PDF ID if provided
    if (pdfId) {
      query = query.eq("pdf_id", pdfId);
    }

    const { data: annotations, error } = await query;

    if (error) {
      console.error("Failed to fetch annotations:", error);
      return NextResponse.json(
        { error: "Failed to fetch annotations" },
        { status: 500 }
      );
    }

    // Transform database rows to application format
    const annotationsResponse = annotations.map((annotation) => ({
      id: annotation.id,
      pdfId: annotation.pdf_id,
      noteId: annotation.note_id,
      userId: annotation.user_id,
      selectedText: annotation.selected_text,
      pageNumber: annotation.page_number,
      coordinates: annotation.coordinates,
      content: annotation.content,
      createdAt: annotation.created_at,
      updatedAt: annotation.updated_at,
    }));
    console.log("Fetched annotations:", annotationsResponse);//will be deleted 
    return NextResponse.json({
      success: true,
      data: annotationsResponse,
    });
  } catch (error) {
    console.error("Annotations fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
