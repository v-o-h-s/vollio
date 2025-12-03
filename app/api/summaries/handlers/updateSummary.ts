import { UpdateSummaryDto } from "@/lib/dto/updateSummaryDto";
import {
  SummaryServerResponse,
  mapSupabaseSummaryResponseToSummary,
} from "@/lib/types/summary";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/supabase/supabase";
import { DatabaseError, AuthError } from "@/lib/error-handling";
import { Logger } from "@/lib/utils/logger";

export const updateSummaryHandler = async (
  request: NextRequest,
  data: UpdateSummaryDto,
  { params }: { params: Promise<{ id: string }> }
) => {
  Logger.info("✏️ Updating summary");

  const { userId } = await auth();

  if (!userId) {
    Logger.warn("🔐 Unauthorized access attempt to update summary");
    throw AuthError.authenticationRequired();
  }

  const { id: summaryId } = await params;

  Logger.info(
    `👤 Updating summary for user: ${userId}, summaryId: ${summaryId}`
  );

  const { mainPoints, attributes } = data;

  const supabase = await getAuthenticatedSupabaseClient();

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
