import { JSONSchemaType } from "ajv";
import { ExplainTextDTO } from "@vollio/shared";

export const ExplainTextDTOSchema: JSONSchemaType<ExplainTextDTO> = {
  type: "object",
  properties: {
    text: { type: "string", minLength: 1, maxLength: 10000 }, // ~1000-2000 words limit, 1000 words is ~5000-7000 chars. 10000 is safe.
  },
  required: ["text"],
  additionalProperties: false,
};
