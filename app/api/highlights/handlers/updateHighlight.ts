import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import {
  mapSupabaseHighlightResponseToHighlight,
  HighlightwithDetails,
  HighlightServerResponse,
} from "@/lib/types/highlight";
import { DatabaseError, AuthError } from "@/lib/utils/error-handling";
import { CreateHighlightDto } from "@/lib/dto/createHighLightDto";

export const updateHighlightHandler = async (
  request: NextRequest,
  data: Partial<CreateHighlightDto>,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    throw AuthError.authenticationRequired();
  }

  const supabase = await getAuthenticatedSupabaseClient();

  // We need to map the camelCase DTO to snake_case database columns
  // This is a bit manual since we don't have a reverse mapper yet
  const updates: any = {};
  if (data.color !== undefined) updates.color = data.color;
  if (data.content !== undefined) updates.content = data.content;
  if (data.hasNote !== undefined) updates.has_note = data.hasNote;
  if (data.noteId !== undefined) updates.note_id = data.noteId;
  if (data.position !== undefined) updates.position = data.position;
  if (data.type !== undefined) updates.type = data.type;
  // pdf_id and user_id usually shouldn't change, but if needed:
  if (data.pdfId !== undefined) updates.pdf_id = data.pdfId;

  updates.updated_at = new Date().toISOString();

  const { data: highlightData, error } = await supabase
    .from("highlights")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId) // Ensure user owns the highlight
    .select()
    .single();

  if (error) {
    throw DatabaseError.mapErrorMessageToDatabaseError(error);
  }

  const serverResponse: HighlightServerResponse = {
    success: true,
    status: 200,
    data: mapSupabaseHighlightResponseToHighlight(highlightData),
    error: null,
  };

  return NextResponse.json(serverResponse);
};
