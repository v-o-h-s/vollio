import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/supabase/supabase";
import {
  mapSupabaseHighlightResponseToHighlight,
  HighlightwithDetails,
} from "@/lib/types/highlight";
import { DatabaseError, AuthError } from "@/lib/error-handling";
import { Logger } from "@/lib/utils/logger";

export const getHighlightsHandler = async (request: NextRequest) => {
  Logger.info("🎨 Fetching highlights");

  const { userId } = await auth();

  if (!userId) {
    Logger.warn("🔐 Unauthorized access attempt to fetch highlights");
    throw AuthError.authenticationRequired();
  }

  const searchParams = request.nextUrl.searchParams;
  const pdfId = searchParams.get("pdfId");

  Logger.info(`👤 Fetching highlights for user: ${userId}`, {
    pdfId: pdfId || "all",
  });

  const supabase = await getAuthenticatedSupabaseClient();

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
