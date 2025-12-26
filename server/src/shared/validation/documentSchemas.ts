import { JSONSchemaType } from "ajv";

// Document ID params
export interface DocumentIdParams {
  id: string;
}

export const documentIdParamsSchema: JSONSchemaType<DocumentIdParams> = {
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

// Move document DTO
export interface MoveDocumentDTO {
  folderId?: string | null;
}

export const moveDocumentSchema: JSONSchemaType<MoveDocumentDTO> = {
  type: "object",
  properties: {
    folderId: {
      type: "string",
      nullable: true,
      pattern:
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
  },
  required: [],
  additionalProperties: false,
};

// Rename document DTO
export interface RenameDocumentDTO {
  name: string;
}

export const renameDocumentSchema: JSONSchemaType<RenameDocumentDTO> = {
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 1,
      maxLength: 255,
      pattern: '^[^<>:"/\\\\|?*]+$', // No invalid name characters
    },
  },
  required: ["name"],
  additionalProperties: false,
};

// Validate query schema (for Google Drive streaming)
export interface QuerySchema {
  token: string;
}
export const validateQuerySchema: JSONSchemaType<QuerySchema> = {
  type: "object",
  properties: {
    token: {
      type: "string",
      minLength: 1,
    },
  },
  required: ["token"],
  additionalProperties: false,
};
