import { DifficultyLevel, ExplanationLevel, QuizLanguage, QuizQuestionsTypeEnum } from "../../validation/quizSchemas";
import { ServerSuccessResponse } from "./general";

export interface QuizResponse {
    id: string;                // quiz UUID
    fileId: string;
    language: QuizLanguage;
    settings: {
        difficultyLevel: DifficultyLevel;
        numberOfQuestions: number;
        timeLimitMinutes?: number;
        explanationLevel: ExplanationLevel;
    };
    questions: QuizQuestion[];
    createdAt: string;         // ISO string
}

interface BaseQuizQuestion {
    id: string;                         // stable for submissions
    type: QuizQuestionsTypeEnum;
    text: string;
    points: number;
    explanation?: string;
}

export interface MCQQuestion extends BaseQuizQuestion {
    type: QuizQuestionsTypeEnum.MCQ;
    options: {
        id: string;
        text: string;
    }[];
    correctOptionIds: string[]; // supports multi-answer
}

export interface TrueFalseQuestion extends BaseQuizQuestion {
    type: QuizQuestionsTypeEnum.TRUE_FALSE;
    correctAnswer: boolean;
}

export interface FillBlanksQuestion extends BaseQuizQuestion {
    type: QuizQuestionsTypeEnum.FILL_IN_THE_BLANKS;
    blanks: {
        id: string;
        acceptableAnswers: string[];
    }[];
}

export interface ShortAnswerQuestion extends BaseQuizQuestion {
    type: QuizQuestionsTypeEnum.SHORT_ANSWER;
    expectedAnswer?: string;
    gradingMode: "manual" | "ai_assisted";
}

export type QuizQuestion =
    | MCQQuestion
    | TrueFalseQuestion
    | FillBlanksQuestion
    | ShortAnswerQuestion;


// POST /api/v1/quizzes    
export type CreateQuizResponse = ServerSuccessResponse<QuizResponse>;

// GET /api/v1/quizzes/:id
export type GetQuizResponse = ServerSuccessResponse<QuizResponse>;