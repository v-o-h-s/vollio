import { NextResponse } from "next/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { z } from "zod";
import type { TextBounds } from "@/lib/types";

// Route parameter types
interface RouteParams {
  params: Promise<{ id: string }>;
}

// Schema for updating highlights
const updateHighlightSchema = z.object({
  textbounds: z.array(z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  })).optional(),
  content: z.string().min(1).optional(),
  title: z.string().optional(),
  color: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  noteId: z.string().uuid().optional()
});

// GET /api/highlights/[id] - Get specific highlight
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await getAuthenticatedSupabaseClient();

    // Get the highlight
    const { data: highlight, error } = await supabase
      .from("highlights")
      .select(`
        *,
        pdf:pdfs(id, title, filename),
        note:notes(id, title, content)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching highlight:", error);
      return NextResponse.json(
        { error: "Failed to fetch highlight" },
        { status: 500 }
      );
    }

    if (!highlight) {
      return NextResponse.json(
        { error: "Highlight not found" },
        { status: 404 }
      );
    }

    // Transform database response to camelCase for frontend
    const transformedHighlight = {
      ...highlight,
      pdfId: highlight.pdf_id,
      noteId: highlight.note_id,
      pageNumber: highlight.page_number,
      createdAt: highlight.created_at,
      updatedAt: highlight.updated_at,
      // Remove snake_case properties
      pdf_id: undefined,
      note_id: undefined,
      page_number: undefined,
      created_at: undefined,
      updated_at: undefined,
    };

    return NextResponse.json({
      success: true,
      data: { highlight: transformedHighlight },
    });
  } catch (error) {
    console.error("Error in GET /api/highlights/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/highlights/[id] - Update specific highlight
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await getAuthenticatedSupabaseClient();

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateHighlightSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: "Invalid request data",
          details: validationResult.error.issues
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Map noteId to note_id for database
    const updateData = {
      ...validatedData,
      ...(validatedData.noteId !== undefined && { note_id: validatedData.noteId }),
    };
    // Remove noteId from the update data since database uses note_id
    delete (updateData as any).noteId;

    // Check if highlight exists and belongs to user
    const { data: existingHighlight, error: fetchError } = await supabase
      .from("highlights")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingHighlight) {
      return NextResponse.json(
        { error: "Highlight not found" },
        { status: 404 }
      );
    }

    // Update the highlight
    const { data: updatedHighlight, error: updateError } = await supabase
      .from("highlights")
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select(`
        *,
        pdf:pdfs(id, title, filename),
        note:notes(id, title, content)
      `)
      .single();

    if (updateError) {
      console.error("Error updating highlight:", updateError);
      return NextResponse.json(
        { error: "Failed to update highlight" },
        { status: 500 }
      );
    }

    // Transform database response to camelCase for frontend
    const transformedHighlight = {
      ...updatedHighlight,
      pdfId: updatedHighlight.pdf_id,
      noteId: updatedHighlight.note_id,
      pageNumber: updatedHighlight.page_number,
      createdAt: updatedHighlight.created_at,
      updatedAt: updatedHighlight.updated_at,
      // Remove snake_case properties
      pdf_id: undefined,
      note_id: undefined,
      page_number: undefined,
      created_at: undefined,
      updated_at: undefined,
    };

    return NextResponse.json({
      success: true,
      data: { highlight: transformedHighlight },
      message: "Highlight updated successfully"
    });
  } catch (error) {
    console.error("Error in PUT /api/highlights/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/highlights/[id] - Delete specific highlight
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await getAuthenticatedSupabaseClient();

    // Check if highlight exists and belongs to user
    const { data: existingHighlight, error: fetchError } = await supabase
      .from("highlights")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existingHighlight) {
      return NextResponse.json(
        { error: "Highlight not found" },
        { status: 404 }
      );
    }

    // Delete the highlight
    const { error: deleteError } = await supabase
      .from("highlights")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error deleting highlight:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete highlight" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Highlight deleted successfully"
    });
  } catch (error) {
    console.error("Error in DELETE /api/highlights/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
