import { UpdateSummaryDto } from "@/lib/dto/updateSummaryDto";
import {
  SummaryServerResponse,
  mapSupabaseSummaryResponseToSummary,
} from "@/lib/types/summary";
import { NextRequest, NextResponse } from "next/server";
import { DatabaseError, AuthError } from "@/lib/error-handling";
import { Logger } from "@/lib/utils/logger";
import { create } from "lodash";
import { createClient } from "@/lib/supabase/server";

export const updateSummaryHandler = async (
  request: NextRequest,
  data: UpdateSummaryDto,
  { params }: { params: Promise<{ id: string }> }
) => {
  Logger.info("✏️ Updating summary");

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims.sub; // same as user.id


  if (!userId) {
    Logger.warn("🔐 Unauthorized access attempt to update summary");
    throw AuthError.authenticationRequired();
  }

  const { id: summaryId } = await params;

  Logger.info(
    `👤 Updating summary for user: ${userId}, summaryId: ${summaryId}`
  );

  const { mainPoints, attributes } = data;


  // Build update object
  const updateData: any = {};
  if (mainPoints !== undefined) updateData.main_points = mainPoints;
  if (attributes !== undefined) updateData.attributes = attributes;

  const { data: summaryData, error } = await supabase
    .from("summaries")
    .update(updateData)
    .eq("id", summaryId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    Logger.error(`❌ Database error updating summary for user ${userId}`, {
      error,
      summaryId,
    });
    throw DatabaseError.mapErrorMessageToDatabaseError(error);
  }

  Logger.success(`✏️ Summary updated successfully`, {
    summaryId: summaryData.id,
    userId,
  });

  const serverResponse: SummaryServerResponse = {
    success: true,
    status: 200,
    data: mapSupabaseSummaryResponseToSummary(summaryData),
    error: null,
  };

  return NextResponse.json(serverResponse);
};
