import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DatabaseError, AuthError } from "@/lib/error-handling";
import { Logger } from "@/lib/utils/logger";

export const deleteHighlightHandler = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  Logger.info("🎨 Deleting highlight", { highlightId: id });

  // Get authenticated Supabase client
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    Logger.warn("🔐 Unauthorized access attempt to delete highlight", {
      highlightId: id,
    });
    throw AuthError.authenticationRequired();
  }

  const userId = user.id;

  Logger.info(`👤 Deleting highlight for user: ${userId}`, {
    highlightId: id,
  });

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
