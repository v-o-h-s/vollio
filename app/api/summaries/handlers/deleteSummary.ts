import { NextRequest, NextResponse } from "next/server";
import { DatabaseError, AuthError } from "@/lib/error-handling";
import { Logger } from "@/lib/utils/logger";
import { createClient } from "@/lib/supabase/server";

export const deleteSummaryHandler = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  Logger.info("🗑️ Deleting summary");



  const { id: summaryId } = await params;

  Logger.info(
    `👤 Deleting summary for user", summaryId: ${summaryId}`
  );

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub; // same as user.id


  const { error } = await supabase
    .from("summaries")
    .delete()
    .eq("id", summaryId)
    .eq("user_id", userId);

  if (error) {
    Logger.error(`❌ Database error deleting summary for user ${userId}`, {
      error,
      summaryId,
    });
    throw DatabaseError.mapErrorMessageToDatabaseError(error);
  }

  Logger.success(`🗑️ Summary deleted successfully`, {
    summaryId,
    userId,
  });

  return NextResponse.json(
    { success: true, status: 204, data: null, error: null },
    { status: 204 }
  );
};
