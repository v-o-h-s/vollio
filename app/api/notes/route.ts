import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { withErrorHandling } from "@/lib/wrappers/withErrorHandling";
import { Logger } from "@/lib/utils/logger";
import { AuthError, DatabaseError } from "@/lib/utils/error-handling";
import { createNoteHandler } from "./handlers/createNote";
import { withValidation } from "@/lib/wrappers/withValidation";
import { createNoteDtoSchema } from "@/lib/dto/createNoteDto";
import { getNotesHandler } from "./handlers/getNotes";

// GET /api/notes - List all notes for the authenticated user
export const GET = withErrorHandling(getNotesHandler);

// POST /api/notes - Create a new note
export const POST = withErrorHandling(
  withValidation(createNoteDtoSchema, createNoteHandler)
);
