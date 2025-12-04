import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Logger } from "@/lib/utils/logger";
import { AuthError, DatabaseError } from "@/lib/error-handling";

export const deleteNoteHandler = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const supabase = await createClient();

  const { id } = await params;

  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) {
    Logger.error("Failed to delete note:", error);
    throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(error.code);
  }

  return NextResponse.json({ success: true });
};
