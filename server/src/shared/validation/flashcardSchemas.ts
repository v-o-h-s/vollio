import { JSONSchemaType } from "ajv";
import { QuizLanguage } from "../../domain/entities/Quiz";

export interface CreateFlashCardsDTO {
  userPrompt?: string;
  documentId: string; // UUID string
  numberOfCards?: number;
  language?: QuizLanguage;
  difficulty?: "Easy" | "Medium" | "Hard";
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
    difficulty: {
      type: "string",
      nullable: true,
      enum: ["Easy", "Medium", "Hard"] as const,
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

export interface CreateManualFlashCardsDTO {
  name: string;
  description?: string;
  language?: string;
  documentId: string;
  flashCards: {
    front: string;
    back: string;
    hint?: string;
  }[];
}

export const createManualFlashCardsSchema: JSONSchemaType<CreateManualFlashCardsDTO> =
  {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1 },
      description: { type: "string", nullable: true },
      language: { type: "string", nullable: true },
      documentId: {
        type: "string",
        pattern:
          "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
      },
      flashCards: {
        type: "array",
        items: {
          type: "object",
          properties: {
            front: { type: "string" },
            back: { type: "string" },
            hint: { type: "string", nullable: true },
          },
          required: ["front", "back"],
        },
        minItems: 1,
      },
    },
    required: ["name", "documentId", "flashCards"],
    additionalProperties: false,
  };
