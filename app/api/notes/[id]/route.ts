import { withErrorHandling } from "@/lib/wrappers/withErrorHandling";
import { withValidation } from "@/lib/wrappers/withValidation";
import { updateNoteDtoSchema } from "@/lib/dto/updateNoteDto";
import { getNoteHandler } from "./handlers/getNote";
import { updateNoteHandler } from "./handlers/updateNote";
import { deleteNoteHandler } from "./handlers/deleteNote";

// GET /api/notes/[id] - Get a specific note
export const GET = withErrorHandling(getNoteHandler);

// PUT /api/notes/[id] - Update a specific note
export const PUT = withErrorHandling(
  withValidation(updateNoteDtoSchema, updateNoteHandler)
);

// DELETE /api/notes/[id] - Delete a specific note
export const DELETE = withErrorHandling(deleteNoteHandler);

// POST /api/notes/[id] - Create a new note
export const POST = withErrorHandling(
  withValidation(updateNoteDtoSchema, updateNoteHandler)
);
