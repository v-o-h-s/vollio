import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { DatabaseError, AuthError } from "@/lib/utils/error-handling";
import { Logger } from "@/lib/utils/logger";

export const deleteHighlightHandler = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  Logger.info("🎨 Deleting highlight", { highlightId: id });

  const { userId } = await auth();

  if (!userId) {
    Logger.warn("🔐 Unauthorized access attempt to delete highlight", {
      highlightId: id,
    });
    throw AuthError.authenticationRequired();
  }

  Logger.info(`👤 Deleting highlight for user: ${userId}`, {
    highlightId: id,
  });

  const supabase = await getAuthenticatedSupabaseClient();

  Logger.info("💾 Deleting highlight from database");

  const { error } = await supabase
    .from("highlights")
    .delete()
    .eq("id", id)
    .eq("user_id", userId); // Ensure user owns the highlight

  if (error) {
    Logger.error(`❌ Database error deleting highlight for user ${userId}`, {
      error,
      highlightId: id,
    });
    throw DatabaseError.mapErrorMessageToDatabaseError(error);
  }

  Logger.success(`🎨 Highlight deleted successfully`, {
    highlightId: id,
    userId,
  });

  return NextResponse.json({
    success: true,
    status: 200,
    id,
    error: null,
  });
};
