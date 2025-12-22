export type JSONContent = {
  type?: string;
  attrs?: Record<string, any>;
  content?: JSONContent[];
  marks?: {
    type: string;
    attrs?: Record<string, any>;
    [key: string]: any;
  }[];
  text?: string;
  [key: string]: any;
};

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
