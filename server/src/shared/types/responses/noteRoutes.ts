import { ServerSuccessResponse } from "./general";
import { JSONContent } from "../note";

// Note data structure returned by endpoints
export interface NoteData {
  id: string;
  title?: string;
  content?: JSONContent;
  documentId?: string;
  createdAt: Date;
  updatedAt: Date;
  isSummary: boolean;
}

// POST /api/v1/notes
export type CreateNoteResponse = ServerSuccessResponse<NoteData>;

// GET /api/v1/notes
export type GetAllNotesResponse = ServerSuccessResponse<NoteData[]>;

// GET /api/v1/notes/:id
export type GetNoteByIdResponse = ServerSuccessResponse<NoteData>;

// PATCH /api/v1/notes/:id
export type UpdateNoteResponse = ServerSuccessResponse<NoteData>;

// DELETE /api/v1/notes/:id
export type DeleteNoteResponse = ServerSuccessResponse<null>;
