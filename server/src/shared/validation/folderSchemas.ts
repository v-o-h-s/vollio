import { JSONSchemaType } from "ajv";

/**
 * DTO for creating a folder
 */
export interface CreateFolderDTO {
  name: string;
  parentId?: string | null;
}

export const createFolderSchema: JSONSchemaType<CreateFolderDTO> = {
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 1,
      maxLength: 255,
    },
    parentId: {
      type: "string",
      nullable: true,
      pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
  },
  required: ["name"],
  additionalProperties: false,
} as any;

/**
 * DTO for updating a folder
 */
export interface UpdateFolderDTO {
  name?: string;
  parentId?: string | null;
}

export const updateFolderSchema: JSONSchemaType<UpdateFolderDTO> = {
  type: "object",
  properties: {
    name: {
      type: "string",
      minLength: 1,
      maxLength: 255,
      nullable: true,
    },
    parentId: {
      type: "string",
      nullable: true,
      pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
  },
  required: [],
  additionalProperties: false,
} as any;

/**
 * DTO for folder ID params
 */
export interface FolderIdParams {
  id: string;
}

export const folderIdParamsSchema: JSONSchemaType<FolderIdParams> = {
  type: "object",
  properties: {
    id: {
      type: "string",
      pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
  },
  required: ["id"],
  additionalProperties: false,
} as any;

/**
 * DTO for moving folder contents
 */
export interface DeleteFolderQuery {
  moveContentsTo?: string | null;
}

export const deleteFolderQuerySchema: JSONSchemaType<DeleteFolderQuery> = {
  type: "object",
  properties: {
    moveContentsTo: {
      type: "string",
      nullable: true,
      pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
  },
  required: [],
  additionalProperties: false,
} as any;
