import { JSONSchemaType } from "ajv";

// File ID params
export interface FileIdParams {
  id: string;
}

export const fileIdParamsSchema: JSONSchemaType<FileIdParams> = {
  type: "object",
  properties: {
    id: {
      type: "string",
      pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
  },
  required: ["id"],
  additionalProperties: false,
};

// Move file DTO
export interface MoveFileDTO {
  folderId?: string | null;
}

export const moveFileSchema: JSONSchemaType<MoveFileDTO> = {
  type: "object",
  properties: {
    folderId: {
      type: "string",
      nullable: true,
      pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
  },
  required: [],
  additionalProperties: false,
};

// Rename file DTO
export interface RenameFileDTO {
  filename: string;
}

export const renameFileSchema: JSONSchemaType<RenameFileDTO> = {
  type: "object",
  properties: {
    filename: {
      type: "string",
      minLength: 1,
      maxLength: 255,
      pattern: "^[^<>:\"/\\\\|?*]+$", // No invalid filename characters
    },
  },
  required: ["filename"],
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
