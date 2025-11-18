import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { withErrorHandling } from "@/lib/utils/error-handling/errorHandling";
import { z } from "zod";

// Route parameter types
interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/pdfs/[id]/highlights
 * Retrieves all highlights for a specific PDF
 * Query parameters:
 * - type: Filter by highlight type (quick, comment, note) (optional)
 * - page: Page number for paginatio n (optional)
 * - limit: Number of highlights per page (optional, max 100)
 */
export const GET = withErrorHandling(async (request: NextRequest, { params }: RouteParams) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { id: pdfId } = await params;

  // Validate PDF ID format
  if (!z.string().uuid().safeParse(pdfId).success) {
    return NextResponse.json(
      { error: "Invalid PDF ID format" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
  const offset = (page - 1) * limit;

  const supabase = await getAuthenticatedSupabaseClient();

  // First verify the PDF exists and belongs to the user
  const { data: pdf, error: pdfError } = await supabase
    .from("pdfs")
    .select("id")
    .eq("id", pdfId)
    .eq("user_id", userId)
    .single();

  if (pdfError || !pdf) {
    return NextResponse.json(
      { error: "PDF not found or access denied" },
      { status: 404 }
    );
  }

  // Build query for highlights
  let query = supabase
    .from("highlights")
    .select(`
      *,
      note:notes(id, title, content)
    `)
    .eq("user_id", userId)
    .eq("pdf_id", pdfId)
    .order("page_number", { ascending: true })
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

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
    .eq("user_id", userId)
    .eq("pdf_id", pdfId);

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
      pdfId,
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