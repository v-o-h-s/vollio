import { JSONSchemaType } from "ajv";
import { JSONContent } from "@vollio/shared";

// Schema for creating a note
export interface CreateNoteDTO {
  title?: string;
  content?: JSONContent;
  documentId?: string;
}

export const createNoteSchema: JSONSchemaType<CreateNoteDTO> = {
  type: "object",
  properties: {
    title: { type: "string", nullable: true },
    content: { type: "object", nullable: true, required: [] } as any,
    documentId: { type: "string", nullable: true },
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
    id: {
      type: "string",
      pattern:
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
  },
  required: ["id"],
  additionalProperties: false,
};
