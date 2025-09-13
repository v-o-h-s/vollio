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
  note_id: z.string().uuid().optional()
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

    return NextResponse.json({ highlight });
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
        ...validatedData,
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

    return NextResponse.json({ 
      highlight: updatedHighlight,
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
