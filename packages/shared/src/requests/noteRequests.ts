import { JSONContent } from "../note";

export interface CreateNoteDTO {
  title?: string;
  content?: JSONContent;
  pdfId?: string;
}

export interface UpdateNoteDTO {
  title?: string;
  content?: JSONContent;
}

export interface NoteIdParams {
  id: string;
}
