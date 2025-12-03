import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  mapSupabaseHighlightResponseToHighlight,
  HighlightwithDetails,
} from "@/lib/types/highlight";
import { DatabaseError, AuthError } from "@/lib/error-handling";
import { Logger } from "@/lib/utils/logger";

export const getHighlightsHandler = async (request: NextRequest) => {
  Logger.info("🎨 Fetching highlights");

  // Get authenticated Supabase client
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    Logger.warn("🔐 Unauthorized access attempt to fetch highlights");
    throw AuthError.authenticationRequired();
  }

  const userId = user.id;

  const searchParams = request.nextUrl.searchParams;
  const pdfId = searchParams.get("pdfId");

  Logger.info(`👤 Fetching highlights for user: ${userId}`, {
    pdfId: pdfId || "all",
  });

  Logger.info("💾 Querying highlights from database");

  let query = supabase.from("highlights").select("*");

  // If pdfId is provided, filter by it
  if (pdfId) {
    query = query.eq("pdf_id", pdfId);
    Logger.info(`🔍 Filtering highlights by PDF ID: ${pdfId}`);
  }

  // Execute the query
  const { data: highlightsData, error } = await query;

  if (error) {
    Logger.error(`❌ Database error fetching highlights for user ${userId}`, {
      error,
      pdfId,
    });
    throw DatabaseError.mapErrorMessageToDatabaseError(error);
  }

  // Map the response to your frontend type
  const mappedHighlights: HighlightwithDetails[] = (highlightsData || []).map(
    mapSupabaseHighlightResponseToHighlight
  );

  Logger.success(
    `🎨 Successfully fetched ${mappedHighlights.length} highlights`,
    {
      count: mappedHighlights.length,
      userId,
      pdfId: pdfId || "all",
    }
  );

  return NextResponse.json({
    success: true,
    status: 200,
    data: mappedHighlights,
    error: null,
  });
};
