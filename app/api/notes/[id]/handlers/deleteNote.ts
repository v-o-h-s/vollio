import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/supabase/supabase";
import { Logger } from "@/lib/utils/logger";
import { AuthError, DatabaseError } from "@/lib/utils/error-handling";

export const deleteNoteHandler = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { userId } = await auth();

  if (!userId) {
    Logger.error("Unauthorized");
    throw AuthError.authenticationRequired();
  }

  const { id } = await params;
  const supabase = await getAuthenticatedSupabaseClient();

  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    Logger.error("Failed to delete note:", error);
    throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(error.code);
  }

  return NextResponse.json({ success: true });
};
