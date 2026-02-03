import { JSONSchemaType } from "ajv";
import {
  QuizQuestionsTypeEnum,
  DifficultyLevel,
  QuizLanguage,
  ExplanationLevel,
} from "../../domain/entities/Quiz";
export {
  QuizQuestionsTypeEnum,
  DifficultyLevel,
  QuizLanguage,
  ExplanationLevel,
} from "../../domain/entities/Quiz";

export interface CreateQuizDTO {
  documentId: string; // UUID string
  difficultyLevel: DifficultyLevel;
  numberOfQuestions?: number;
  language?: QuizLanguage;

  explanationLevel?: ExplanationLevel;
  questionsDistribution?: Partial<Record<QuizQuestionsTypeEnum, number>>;
}

export const createQuizSchema: JSONSchemaType<CreateQuizDTO> = {
  type: "object",
  properties: {
    documentId: {
      type: "string",
      pattern:
        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    },
    difficultyLevel: {
      type: "string",
      enum: [
        DifficultyLevel.EASY,
        DifficultyLevel.MEDIUM,
        DifficultyLevel.HARD,
      ] as const,
      nullable: false,
    },
    numberOfQuestions: {
      type: "integer",
      nullable: true,
      minimum: 1,
      maximum: 44,
    },

    language: {
      type: "string",
      nullable: true,
      enum: [QuizLanguage.EN, QuizLanguage.FR, QuizLanguage.AR] as const,
    },

    explanationLevel: {
      type: "string",
      nullable: true,
      enum: [
        ExplanationLevel.NONE,
        ExplanationLevel.BRIEF,
        ExplanationLevel.DETAILED,
      ] as const,
    },
    questionsDistribution: {
      type: "object",
      nullable: true,
      properties: {
        [QuizQuestionsTypeEnum.MCQ]: { type: "number", nullable: true },
        [QuizQuestionsTypeEnum.TRUE_FALSE]: { type: "number", nullable: true },
      },
      required: [],
      additionalProperties: false,
    } as const,
  },
  required: ["documentId", "difficultyLevel"],
  additionalProperties: false,
};

// Params schema for routes that take a quiz id
export interface QuizIdParams {
  id: string;
}

export const quizIdParamsSchema: JSONSchemaType<QuizIdParams> = {
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
