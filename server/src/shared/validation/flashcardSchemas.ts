import { JSONSchemaType } from "ajv";
import { QuizLanguage } from "../../domain/entities/Quiz";

export interface CreateFlashCardsDTO {
  userPrompt?: string;
  documentId: string; // UUID string
  numberOfCards?: number;
  language?: QuizLanguage;
}

export const createFlashCardsSchema: JSONSchemaType<CreateFlashCardsDTO> = {
  type: "object",
  properties: {
    userPrompt: { type: "string", nullable: true },
    documentId: {
      type: "string",
      pattern:
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
    numberOfCards: {
      type: "integer",
      nullable: true,
      minimum: 1,
      maximum: 50,
    },
    language: {
      type: "string",
      nullable: true,
      enum: [QuizLanguage.EN, QuizLanguage.FR, QuizLanguage.AR] as const,
    },
  },
  required: ["documentId"],
  additionalProperties: false,
};

export interface FlashCardsSetIdParams {
  id: string;
}

export const flashCardsSetIdParamsSchema: JSONSchemaType<FlashCardsSetIdParams> =
  {
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
