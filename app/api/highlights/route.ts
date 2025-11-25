import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { withErrorHandling } from "@/lib/utils/error-handling";
import { z } from "zod";

// Validation schema for TextBounds
const textBoundsSchema = z.object({
  x: z.number().min(0, "X coordinate must be non-negative"),
  y: z.number().min(0, "Y coordinate must be non-negative"),
  width: z.number().min(0, "Width must be positive"),
  height: z.number().min(0, "Height must be positive"),
});

// Validation schema for highlight creation
// Schema for creating highlights
const createHighlightSchema = z.object({
  pdfId: z.string().uuid(),
  noteId: z.string().uuid().optional(),
  content: z.string().min(1),
  title: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#FFFF00"),
  opacity: z.number().min(0.1).max(1.0).default(0.4),
  pageNumber: z.number().int().min(1),
  type: z.enum(["quick", "comment", "note"]).default("quick"),
  textbounds: z.array(z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  })).min(1)
}).refine((data) => {
  // Only "note" type requires noteId
  if (data.type === "note" && !data.noteId) {
    return false;
  }
  // "quick" and "comment" types should not have noteId
  if ((data.type === "quick" || data.type === "comment") && data.noteId) {
    return false;
  }
  return true;
}, {
  message: "Note type highlights require noteId, quick and comment types should not have noteId",
  path: ["noteId"]
});
/**
 * GET /api/highlights
 * Retrieves highlights for the authenticated user
 * Query parameters:
 * - pdfId: Filter by PDF ID (optional)
 * - noteId: Filter by note ID (optional)
 * - type: Filter by highlight type - 'quick', 'comment', or 'note' (optional)
 * - page: Page number for pagination (optional)
 * - limit: Number of highlights per page (optional, max 100)
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
  const noteId = searchParams.get("noteId");
  const type = searchParams.get("type");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = (page - 1) * limit;

  const supabase = await getAuthenticatedSupabaseClient();

  // Build query with optional filters
  let query = supabase
    .from("highlights")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (pdfId) {
    // Validate PDF ID format
    if (!z.string().uuid().safeParse(pdfId).success) {
      return NextResponse.json(
        { error: "Invalid PDF ID format" },
        { status: 400 }
      );
    }
    query = query.eq("pdf_id", pdfId);
  }

  if (noteId) {
    // Validate note ID format
    if (!z.string().uuid().safeParse(noteId).success) {
      return NextResponse.json(
        { error: "Invalid note ID format" },
        { status: 400 }
      );
    }
    query = query.eq("note_id", noteId);
  }

  if (type) {
    // Validate type format
    if (!z.enum(["quick", "comment", "note"]).safeParse(type).success) {
      return NextResponse.json(
        { error: "Invalid type. Must be 'quick', 'comment', or 'note'" },
        { status: 400 }
      );
    }
    query = query.eq("type", type);
  }

  const { data: highlights, error } = await query;

  if (error) {
    console.error("Database error fetching highlights:", error);
    return NextResponse.json(
      { error: "Failed to fetch highlights" },
      { status: 500 }
    );
  }

  // Get total count for pagination
  let countQuery = supabase
    .from("highlights")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (pdfId) {
    countQuery = countQuery.eq("pdf_id", pdfId);
  }
  if (noteId) {
    countQuery = countQuery.eq("note_id", noteId);
  }
  if (type) {
    countQuery = countQuery.eq("type", type);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    console.error("Database error counting highlights:", countError);
    // Continue without count if this fails
  }

  const totalPages = count ? Math.ceil(count / limit) : 1;

  // Transform database response to camelCase for frontend
  const transformedHighlights = highlights.map(highlight => ({
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
  }));

  return NextResponse.json({
    success: true,
    data: {
      highlights: transformedHighlights,
      total: count || 0,
    },
    pagination: {
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

/**
 * POST /api/highlights
 * Creates a new highlight
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
  const validationResult = createHighlightSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      {
        error: "Invalid highlight data",
        details: validationResult.error.issues,
      },
      { status: 400 }
    );
  }

  const validatedData = validationResult.data;
  const supabase = await getAuthenticatedSupabaseClient();

  // Verify PDF exists and belongs to user
  const { data: pdf, error: pdfError } = await supabase
    .from("pdfs")
    .select("id")
    .eq("id", validatedData.pdfId)
    .eq("user_id", userId)
    .single();

  if (pdfError || !pdf) {
    return NextResponse.json(
      { error: "PDF not found or access denied" },
      { status: 404 }
    );
  }

  // If noteId is provided, verify note exists and belongs to user
  if (validatedData.noteId) {
    const { data: note, error: noteError } = await supabase
      .from("notes")
      .select("id")
      .eq("id", validatedData.noteId)
      .eq("user_id", userId)
      .single();

    if (noteError || !note) {
      return NextResponse.json(
        { error: "Note not found or access denied" },
        { status: 404 }
      );
    }
  }

  // Create the highlight
  const { data: highlight, error: createError } = await supabase
    .from("highlights")
    .insert({
      user_id: userId,
      pdf_id: validatedData.pdfId,
      note_id: validatedData.noteId || null,
      content: validatedData.content,
      title: validatedData.title || null,
      color: validatedData.color,
      opacity: validatedData.opacity,
      page_number: validatedData.pageNumber,
      type: validatedData.type,
      textbounds: validatedData.textbounds,
    })
    .select()
    .single();

  if (createError) {
    console.error("Database error creating highlight:", createError);
    return NextResponse.json(
      { error: "Failed to create highlight" },
      { status: 500 }
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
  }, { status: 201 });
});
