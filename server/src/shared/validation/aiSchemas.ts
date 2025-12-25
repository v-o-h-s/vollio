import { JSONSchemaType } from "ajv";
import { ExplainTextDTO, AssistantDTO } from "@vollio/shared";

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
    fileId: { type: "string", format: "uuid" },
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
  },
  required: ["message", "fileId"],
  additionalProperties: false,
};
