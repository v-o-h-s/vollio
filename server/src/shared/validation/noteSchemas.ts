import { JSONSchemaType } from "ajv";
import { JSONContent } from "../types/note";

// Schema for creating a note
export interface CreateNoteDTO {
  title?: string;
  content?: JSONContent;
  pdfId?: string;
}

export const createNoteSchema: JSONSchemaType<CreateNoteDTO> = {
  type: "object",
  properties: {
    title: { type: "string", nullable: true },
    content: { type: "object", nullable: true, required: [] } as any,
    pdfId: { type: "string", nullable: true },
  },
  required: [],
  additionalProperties: false,
};

// Schema for updating a note
export interface UpdateNoteDTO {
  title?: string;
  content?: JSONContent;
}

export const updateNoteSchema: JSONSchemaType<UpdateNoteDTO> = {
  type: "object",
  properties: {
    title: { type: "string", nullable: true },
    content: { type: "object", nullable: true, required: [] } as any,
  },
  required: [],
  additionalProperties: false,
};

// Schema for route params with ID
export interface NoteIdParams {
  id: string;
}

export const noteIdParamsSchema: JSONSchemaType<NoteIdParams> = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};
