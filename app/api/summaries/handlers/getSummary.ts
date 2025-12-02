import {
  SummaryServerResponse,
  mapSupabaseSummaryResponseToSummary,
} from "@/lib/types/summary";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/supabase/supabase";
import { DatabaseError, AuthError } from "@/lib/utils/error-handling";
import { Logger } from "@/lib/utils/logger";

export const getSummaryHandler = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const pdfId = searchParams.get("pdfId");

  if (!pdfId) {
    return NextResponse.json(
      {
        success: false,
        status: 400,
        data: null,
        error: "Missing pdfId query parameter",
      },
      { status: 400 }
    );
  }

  Logger.info("📖 Fetching summary by pdfId");

  const { userId } = await auth();

  if (!userId) {
    Logger.warn("🔐 Unauthorized access attempt to get summary");
    throw AuthError.authenticationRequired();
  }

  Logger.info(`👤 Fetching summary for user: ${userId}, pdfId: ${pdfId}`);

  const supabase = await getAuthenticatedSupabaseClient();

  const { data: summaryData, error } = await supabase
    .from("summaries")
    .select("*")
    .eq("pdf_id", pdfId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    Logger.error(`❌ Database error fetching summary for user ${userId}`, {
      error,
      pdfId,
    });
    throw DatabaseError.mapErrorMessageToDatabaseError(error);
  }

  if (!summaryData) {
    Logger.info(`📭 No summary found for pdfId: ${pdfId}`);
    const serverResponse: SummaryServerResponse = {
      success: true,
      status: 200,
      data: null,
      error: null,
    };
    return NextResponse.json(serverResponse, { status: 200 });
  }

  Logger.success(`📖 Summary fetched successfully`, {
    summaryId: summaryData.id,
    pdfId: summaryData.pdf_id,
    userId,
  });

  const serverResponse: SummaryServerResponse = {
    success: true,
    status: 200,
    data: mapSupabaseSummaryResponseToSummary(summaryData),
    error: null,
  };

  return NextResponse.json(serverResponse, { status: 200 });
};
