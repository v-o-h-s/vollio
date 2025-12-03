import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  mapSupabaseHighlightResponseToHighlight,
  HighlightServerResponse,
} from "@/lib/types/highlight";
import { DatabaseError, AuthError } from "@/lib/error-handling";
import { CreateHighlightDto } from "@/lib/dto/createHighLightDto";
import { Logger } from "@/lib/utils/logger";

export const updateHighlightHandler = async (
  request: NextRequest,
  data: Partial<CreateHighlightDto>,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;

  Logger.info("🎨 Updating highlight", { highlightId: id });

  // Get authenticated Supabase client
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    Logger.warn("🔐 Unauthorized access attempt to update highlight", {
      highlightId: id,
    });
    throw AuthError.authenticationRequired();
  }

  const userId = user.id;

  Logger.info(`👤 Updating highlight for user: ${userId}`, {
    highlightId: id,
  });

  // We need to map the camelCase DTO to snake_case database columns
  const updates: any = {};
  if (data.color !== undefined) updates.color = data.color;
  if (data.content !== undefined) updates.content = data.content;
  if (data.hasNote !== undefined) updates.has_note = data.hasNote;
  if (data.noteId !== undefined) updates.note_id = data.noteId;
  if (data.position !== undefined) updates.position = data.position;
  if (data.type !== undefined) updates.type = data.type;
  if (data.pdfId !== undefined) updates.pdf_id = data.pdfId;
  if (data.tags !== undefined) updates.tags = data.tags;
  if (data.style !== undefined) updates.style = data.style;

  updates.updated_at = new Date().toISOString();

  Logger.info("📋 Highlight updates to apply", {
    highlightId: id,
    fieldsUpdated: Object.keys(updates),
  });

  Logger.info("💾 Updating highlight in database");

  const { data: highlightData, error } = await supabase
    .from("highlights")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId) // Ensure user owns the highlight
    .select()
    .single();

  if (error) {
    Logger.error(`❌ Database error updating highlight for user ${userId}`, {
      error,
      highlightId: id,
    });
    throw DatabaseError.mapErrorMessageToDatabaseError(error);
  }

  Logger.success(`🎨 Highlight updated successfully`, {
    highlightId: id,
    userId,
    fieldsUpdated: Object.keys(updates),
  });

  const serverResponse: HighlightServerResponse = {
    success: true,
    status: 200,
    data: mapSupabaseHighlightResponseToHighlight(highlightData),
    error: null,
  };

  return NextResponse.json(serverResponse);
};
