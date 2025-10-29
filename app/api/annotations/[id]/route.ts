import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { withErrorHandling } from "@/lib/utils/error-handling/server-error-handling";
import { z } from "zod";

// Validation schema for annotation updates
const updateAnnotationSchema = z.object({
  selectedText: z
    .string()
    .min(1, "Selected text is required")
    .max(5000, "Selected text too long")
    .optional(),
  noteContent: z.string().optional(),
  coordinates: z.object({
    x: z.number().min(0, "X coordinate must be non-negative"),
    y: z.number().min(0, "Y coordinate must be non-negative"),
    width: z.number().min(0, "Width must be positive"),
    height: z.number().min(0, "Height must be positive"),
  }).optional(),
  style: z.object({
    highlightColor: z.string().optional(),
    borderColor: z.string().optional(),
    opacity: z.number().min(0).max(1).optional(),
  }).optional(),
});

/**
 * GET /api/annotations/[id]
 * Retrieves a specific annotation by ID
 */
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Annotation ID is required" },
      { status: 400 }
    );
  }

  const supabase = await getAuthenticatedSupabaseClient();

  try {
    const { data: annotation, error } = await supabase
      .from("annotations")
      .select(`
        id,
        pdf_id,
        note_id,
        user_id,
        selected_text,
        page_number,
        coordinates,
        note_content,
        style,
        created_at,
        updated_at
      `)
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error || !annotation) {
      return NextResponse.json(
        { error: "Annotation not found or access denied" },
        { status: 404 }
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
      noteContent: annotation.note_content,
      style: annotation.style || {
        highlightColor: "rgba(255, 255, 0, 0.3)",
        borderColor: "rgba(255, 193, 7, 0.6)",
        opacity: 0.3,
      },
      createdAt: annotation.created_at,
      updatedAt: annotation.updated_at,
    };

    return NextResponse.json({
      success: true,
      data: annotationResponse,
    });
  } catch (error) {
    console.error("Annotation fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/annotations/[id]
 * Updates an existing annotation
 */
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Annotation ID is required" },
      { status: 400 }
    );
  }

  const body = await request.json();

  // Validate request data
  const validationResult = updateAnnotationSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: "Invalid annotation data",
        details: validationResult.error.issues,
      },
      { status: 400 }
    );
  }

  const updates = validationResult.data;
  const supabase = await getAuthenticatedSupabaseClient();

  try {
    // Verify annotation exists and belongs to user
    const { data: existingAnnotation, error: fetchError } = await supabase
      .from("annotations")
      .select("id, user_id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingAnnotation) {
      return NextResponse.json(
        { error: "Annotation not found or access denied" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.selectedText !== undefined) {
      updateData.selected_text = updates.selectedText;
    }
    if (updates.noteContent !== undefined) {
      updateData.note_content = updates.noteContent;
    }
    if (updates.coordinates !== undefined) {
      updateData.coordinates = updates.coordinates;
    }
    if (updates.style !== undefined) {
      updateData.style = updates.style;
    }

    // Update the annotation
    const { data: annotation, error: updateError } = await supabase
      .from("annotations")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", userId)
      .select(`
        id,
        pdf_id,
        note_id,
        user_id,
        selected_text,
        page_number,
        coordinates,
        note_content,
        style,
        created_at,
        updated_at
      `)
      .single();

    if (updateError) {
      console.error("Failed to update annotation:", updateError);
      return NextResponse.json(
        { error: "Failed to update annotation", details: updateError.message },
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
      noteContent: annotation.note_content,
      style: annotation.style || {
        highlightColor: "rgba(255, 255, 0, 0.3)",
        borderColor: "rgba(255, 193, 7, 0.6)",
        opacity: 0.3,
      },
      createdAt: annotation.created_at,
      updatedAt: annotation.updated_at,
    };

    console.log("Annotation updated successfully:", annotationResponse);

    return NextResponse.json({
      success: true,
      data: annotationResponse,
    });
  } catch (error) {
    console.error("Annotation update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/annotations/[id]
 * Deletes an annotation
 */
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json(
      { error: "Annotation ID is required" },
      { status: 400 }
    );
  }

  const supabase = await getAuthenticatedSupabaseClient();

  try {
    // Verify annotation exists and belongs to user
    const { data: existingAnnotation, error: fetchError } = await supabase
      .from("annotations")
      .select("id, user_id, note_id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingAnnotation) {
      return NextResponse.json(
        { error: "Annotation not found or access denied" },
        { status: 404 }
      );
    }

    // Delete the annotation
    const { error: deleteError } = await supabase
      .from("annotations")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (deleteError) {
      console.error("Failed to delete annotation:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete annotation", details: deleteError.message },
        { status: 500 }
      );
    }

    console.log("Annotation deleted successfully:", id);

    return NextResponse.json({
      success: true,
      data: { id, deleted: true },
    });
  } catch (error) {
    console.error("Annotation deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});