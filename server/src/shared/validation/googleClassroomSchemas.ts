import { JSONSchemaType } from "ajv";
export interface GoogleCallbackQuery {
  code: string;
  scope?: string;
  state?: string;
}
export const GoogleCallbackQuerySchema: JSONSchemaType<GoogleCallbackQuery> = {
  type: "object",
  properties: {
    code: { type: "string" },
    scope: { type: "string", nullable: true },
    state: { type: "string", nullable: true },
  },
  required: ["code"],
  additionalProperties: false,
};
