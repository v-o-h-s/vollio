import {
  SummaryServerResponse,
  mapSupabaseSummaryResponseToSummary,
} from "@/lib/types/summary";
import { NextRequest, NextResponse } from "next/server";
import { DatabaseError, AuthError } from "@/lib/error-handling";
import { Logger } from "@/lib/utils/logger";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub; // same as user.id


  if (!userId) {
    Logger.warn("🔐 Unauthorized access attempt to get summary");
    throw AuthError.authenticationRequired();
  }

  Logger.info(`👤 Fetching summary for user: ${userId}, pdfId: ${pdfId}`);


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
