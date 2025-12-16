import { JSONSchemaType } from "ajv";
export enum QuizQuestionsTypeEnum {
    MCQ = "mcq",
    TRUE_FALSE = "true_false",
    FILL_IN_THE_BLANKS = "fill_blanks",
    SHORT_ANSWER = "short_answer",
}

export enum DifficultyLevel {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard"
}
export enum QuizLanguage {
    EN = "en",
    FR = "fr",
    AR = "ar"
}
export enum ExplanationLevel {
    NONE = "none",
    BRIEF = "brief",
    DETAILED = "detailed"
}


export interface CreateQuizDTO {
    userPrompt?: string;
    fileId: string; // UUID string
    difficultyLevel: DifficultyLevel;
    numberOfQuestions?: number;
    language?: QuizLanguage;
    timeLimitMinutes?: number;
    explanationLevel?: ExplanationLevel;
    randomSeed?: number;
    questionsDistribution?: Partial<Record<QuizQuestionsTypeEnum, number>>;
}

export const createQuizSchema: JSONSchemaType<CreateQuizDTO> = {
    type: "object",
    properties: {
        userPrompt: { type: "string", nullable: true },
        fileId: {
            type: "string",
            pattern:
                "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        },
        difficultyLevel: { type: "string", enum: [DifficultyLevel.EASY, DifficultyLevel.MEDIUM, DifficultyLevel.HARD] as const },
        numberOfQuestions: { type: "integer", nullable: true, minimum: 1, maximum: 44 },

        language: { type: "string", nullable: true, enum: [QuizLanguage.EN, QuizLanguage.FR, QuizLanguage.AR] as const },
        timeLimitMinutes: { type: "integer", nullable: true, minimum: 1 },
        explanationLevel: { type: "string", nullable: true, enum: [ExplanationLevel.NONE, ExplanationLevel.BRIEF, ExplanationLevel.DETAILED] as const },
        randomSeed: { type: "integer", nullable: true },
        questionsDistribution: {
            type: "object",
            nullable: true,
            properties: {
                [QuizQuestionsTypeEnum.MCQ]: { type: "number", nullable: true },
                [QuizQuestionsTypeEnum.TRUE_FALSE]: { type: "number", nullable: true },
                [QuizQuestionsTypeEnum.FILL_IN_THE_BLANKS]: { type: "number", nullable: true },
                [QuizQuestionsTypeEnum.SHORT_ANSWER]: { type: "number", nullable: true },
            },
            required: [],
            additionalProperties: false,
        } as const,
    },
    required: ["fileId", "difficultyLevel"],
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


