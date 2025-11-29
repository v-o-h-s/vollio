import { CreateHighlightDto } from "@/lib/dto/createHighLightDto";
import { Highlight, HighlightServerResponse } from "@/lib/types/highlight";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { mapSupabaseHighlightResponseToHighlight } from "@/lib/types/highlight";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { DatabaseError, AuthError } from "@/lib/utils/error-handling";

export const createHighlightHandler = async (
    request: NextRequest,
  data: CreateHighlightDto,
) => {
  const { userId } = await auth();

  if (!userId) {
    throw AuthError.authenticationRequired();
  }

  const { id,pdfId, type, content, position, color, hasNote, noteId } = data;

  const supabase = await getAuthenticatedSupabaseClient();    

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
    })
    .select()
    .single();

  if (error) {
    throw DatabaseError.mapErrorMessageToDatabaseError(error);
  }
  const serverResponse: HighlightServerResponse = {
    success: true,
    status: 201,
    data: mapSupabaseHighlightResponseToHighlight(highlightData),
    error: null,
  };
  return NextResponse.json(serverResponse);
};
