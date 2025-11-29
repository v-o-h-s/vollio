import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { DatabaseError, AuthError } from "@/lib/utils/error-handling";

export const deleteHighlightHandler = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    throw AuthError.authenticationRequired();
  }

  const supabase = await getAuthenticatedSupabaseClient();

  const { error } = await supabase
    .from("highlights")
    .delete()
    .eq("id", id)
    .eq("user_id", userId); // Ensure user owns the highlight

  if (error) {
    throw DatabaseError.mapErrorMessageToDatabaseError(error);
  }

  return NextResponse.json({
    success: true,
    status: 200,
    id,
    error: null,
  });
};
