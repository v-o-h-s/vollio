import { CreateSummaryDto } from "@/lib/dto/createSummaryDto";
import {
  SummaryServerResponse,
  mapSupabaseSummaryResponseToSummary,
} from "@/lib/types/summary";
import { NextRequest, NextResponse } from "next/server";
import { DatabaseError, AuthError } from "@/lib/error-handling";
import { Logger } from "@/lib/utils/logger";
import { create } from "lodash";
import { createClient } from "@/lib/supabase/server";

export const createSummaryHandler = async (
  request: NextRequest,
  data: CreateSummaryDto
) => {
  Logger.info("📝 Creating or updating summary");



  const { pdfId, mainPoints, attributes } = data;

  Logger.info("📋 Summary data received", {
    pdfId,
    mainPointsCount: mainPoints?.length || 0,
  });

  const supabase = await createClient();

  Logger.info("💾 Upserting summary into database");

  // Use upsert to handle "one summary per user per PDF" constraint
  const { data: summaryData, error } = await supabase
    .from("summaries")
    .upsert(
      {
        pdf_id: pdfId,
        main_points: mainPoints || [],
        attributes: attributes || null,
      },
      {
        onConflict: "user_id,pdf_id",
      }
    )
    .select()
    .single();

  if (error) {
    Logger.error(`❌ Database error creating summary`, {
      error,
      pdfId,
    });
    throw DatabaseError.mapErrorMessageToDatabaseError(error);
  }

  Logger.success(`📝 Summary created/updated successfully`, {
    summaryId: summaryData.id,
    pdfId: summaryData.pdf_id,
  });

  const serverResponse: SummaryServerResponse = {
    success: true,
    status: 201,
    data: mapSupabaseSummaryResponseToSummary(summaryData),
    error: null,
  };

  return NextResponse.json(serverResponse, { status: 201 });
};
