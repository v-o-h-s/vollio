import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { DatabaseError, AuthError } from "@/lib/utils/error-handling";
import { Logger } from "@/lib/utils/logger";

export const deleteSummaryHandler = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  Logger.info("🗑️ Deleting summary");

  const { userId } = await auth();

  if (!userId) {
    Logger.warn("🔐 Unauthorized access attempt to delete summary");
    throw AuthError.authenticationRequired();
  }

  const { id: summaryId } = await params;

  Logger.info(
    `👤 Deleting summary for user: ${userId}, summaryId: ${summaryId}`
  );

  const supabase = await getAuthenticatedSupabaseClient();

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
