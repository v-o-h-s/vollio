import { JSONContent } from "../note";

export interface CreateNoteDTO {
  id?: string;
  title?: string;
  content?: JSONContent;
  documentId?: string;
  color?: string;
  is_auto_generated?: boolean;
}

export interface UpdateNoteDTO {
  title?: string;
  content?: JSONContent;
}

export interface NoteIdParams {
  id: string;
}
