import { JSONSchemaType } from "ajv";
import {
  ExplainTextDTO,
  AssistantDTO,
  GenerateSummaryDTO,
} from "../../shared";

export const ExplainTextDTOSchema: JSONSchemaType<ExplainTextDTO> = {
  type: "object",
  properties: {
    text: { type: "string", minLength: 1, maxLength: 10000 },
  },
  required: ["text"],
  additionalProperties: false,
};

export const AssistantDTOSchema: JSONSchemaType<AssistantDTO> = {
  type: "object",
  properties: {
    message: { type: "string", minLength: 1 },
    history: {
      type: "array",
      items: {
        type: "object",
        properties: {
          role: { type: "string", enum: ["user", "assistant"] },
          content: { type: "string" },
        },
        required: ["role", "content"],
        additionalProperties: false,
      },
      nullable: true,
    },
    model: {
      type: "string",
      enum: ["fast", "smart", "creative"],
      nullable: true,
    },
    tone: {
      type: "string",
      enum: ["academic", "friendly", "concise"],
      nullable: true,
    },
  },
  required: ["message"],
  additionalProperties: false,
};

export const GenerateSummaryDTOSchema: JSONSchemaType<GenerateSummaryDTO> = {
  type: "object",
  properties: {
    documentId: { type: "string" },
  },
  required: ["documentId"],
  additionalProperties: false,
};
