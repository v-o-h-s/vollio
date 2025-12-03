import { CreateHighlightDto } from "@/lib/dto/createHighLightDto";
import { HighlightServerResponse } from "@/lib/types/highlight";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapSupabaseHighlightResponseToHighlight } from "@/lib/types/highlight";
import { DatabaseError, AuthError } from "@/lib/error-handling";
import { Logger } from "@/lib/utils/logger";

export const createHighlightHandler = async (
  request: NextRequest,
  data: CreateHighlightDto
) => {
  Logger.info("🎨 Creating new highlight");

  // Get authenticated Supabase client
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    Logger.warn("🔐 Unauthorized access attempt to create highlight");
    throw AuthError.authenticationRequired();
  }

  const userId = user.id;

  Logger.info(`👤 Creating highlight for user: ${userId}`);

  const {
    id,
    pdfId,
    type,
    content,
    position,
    color,
    hasNote,
    noteId,
    tags,
    style,
  } = data;

  Logger.info("📋 Highlight data received", {
    highlightId: id,
    pdfId,
    type,
    hasNote,
    color,
    tags,
    style,
  });

  Logger.info("💾 Inserting highlight into database");

  const { data: highlightData, error } = await supabase
    .from("highlights")
    .insert({
      id,
      pdf_id: pdfId,
      type: type || "text",
      content,
      position,
      color,
      has_note: hasNote ?? false,
      note_id: noteId,
      user_id: userId,
      tags,
      style,
    })
    .select()
    .single();

  if (error) {
    Logger.error(`❌ Database error creating highlight for user ${userId}`, {
      error,
      highlightId: id,
      pdfId,
    });
    throw DatabaseError.mapErrorMessageToDatabaseError(error);
  }

  Logger.success(`🎨 Highlight created successfully`, {
    highlightId: highlightData.id,
    pdfId: highlightData.pdf_id,
    type: highlightData.type,
    userId,
  });

  const serverResponse: HighlightServerResponse = {
    success: true,
    status: 201,
    data: mapSupabaseHighlightResponseToHighlight(highlightData),
    error: null,
  };

  return NextResponse.json(serverResponse, { status: 201 });
};
