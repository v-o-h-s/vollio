import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import {
  mapSupabaseHighlightResponseToHighlight,
  HighlightwithDetails,
} from "@/lib/types/highlight";
import { DatabaseError, AuthError } from "@/lib/utils/error-handling";

export const getHighlightsHandler = async (request: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    throw AuthError.authenticationRequired();
  }

  const searchParams = request.nextUrl.searchParams;
  const pdfId = searchParams.get("pdfId");

  const supabase = await getAuthenticatedSupabaseClient();

  let query = supabase.from("highlights").select("*");

  // If pdfId is provided, filter by it
  if (pdfId) {
    query = query.eq("pdf_id", pdfId);
  }

  // Execute the query
  const { data: highlightsData, error } = await query;

  if (error) {
    throw DatabaseError.mapErrorMessageToDatabaseError(error);
  }

  // Map the response to your frontend type
  const mappedHighlights: HighlightwithDetails[] = (highlightsData || []).map(
    mapSupabaseHighlightResponseToHighlight
  );

  return NextResponse.json({
    success: true,
    status: 200,
    data: mappedHighlights,
    error: null,
  });
};
