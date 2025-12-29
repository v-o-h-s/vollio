import { JSONSchemaType } from "ajv";
/**
 * schema for creating a summary
 */
export interface CreateSummaryDTO {
  documentId: string;
  text?: string;
}

export const CreateSummaryDTOSchema: JSONSchemaType<CreateSummaryDTO> = {
  type: "object",
  properties: {
    documentId: { type: "string" },
    text: { type: "string", nullable: true },
  },
  required: ["documentId"],
  additionalProperties: false,
};

/**
 * schema for updating a summary
 */
export interface UpdateSummaryDTO {
  id: string;
  text?: string;
}

export const UpdateSummaryDTOSchema: JSONSchemaType<UpdateSummaryDTO> = {
  type: "object",
  properties: {
    id: { type: "string" },
    text: { type: "string", nullable: true },
  },
  required: ["id"],
  additionalProperties: false,
};

/**
 * schema for deleting a summary
 */
export interface DeleteSummaryDTO {
  id: string;
}

export const DeleteSummaryDTOSchema: JSONSchemaType<DeleteSummaryDTO> = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

/**
 * schema for getting a summary by documentId
 */
export interface GetSummaryByDocumentIdDTO {
  documentId: string;
}

export const GetSummaryByDocumentIdDTOSchema: JSONSchemaType<GetSummaryByDocumentIdDTO> =
  {
    type: "object",
    properties: {
      documentId: { type: "string" },
    },
    required: ["documentId"],
    additionalProperties: false,
  };

/**
 * schema for getting a summary by id
 */
export interface GetSummaryByIdDTO {
  id: string;
}

export const GetSummaryByIdDTOSchema: JSONSchemaType<GetSummaryByIdDTO> = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};
