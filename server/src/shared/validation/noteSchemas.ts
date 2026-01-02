import { JSONSchemaType } from "ajv";
import {
  JSONContent,
  CreateNoteDTO,
  UpdateNoteDTO,
  NoteIdParams,
  GenerateSummaryDTO,
} from "@vollio/shared";

export {
  JSONContent,
  CreateNoteDTO,
  UpdateNoteDTO,
  NoteIdParams,
  GenerateSummaryDTO,
};

// Schema for creating a note
export const createNoteSchema: JSONSchemaType<CreateNoteDTO> = {
  type: "object",
  properties: {
    id: {
      type: "string",
      pattern:
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
      nullable: true,
    },
    title: { type: "string", nullable: true },
    content: { type: "object", nullable: true, required: [] } as any,
    documentId: { type: "string", nullable: true },
    color: { type: "string", nullable: true },
    is_auto_generated: { type: "boolean", nullable: true },
  },
  required: [],
  additionalProperties: false,
};

// Schema for updating a note
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

// Schema for creating summary of document Id
export const generateSummarySchema: JSONSchemaType<GenerateSummaryDTO> = {
  type: "object",
  properties: {
    documentId: {
      type: "string",
    },
  },
  required: ["documentId"],
  additionalProperties: false,
};