import {
  DifficultyLevel,
  ExplanationLevel,
  QuizLanguage,
} from "../../validation/quizSchemas";
import { ServerSuccessResponse } from "./general";
import { QuizQuestion } from "../../../domain/entities/Quiz";

// POST /api/v1/quizzes  (data)
export interface CreateQuizResponse {
  id: string; // quiz UUID
  title: string | null;
  fileId: string;
  language: QuizLanguage;
  settings: {
    difficultyLevel: DifficultyLevel | null;
    numberOfQuestions: number | null;
    timeLimitMinutes: number | null;
    explanationLevel: ExplanationLevel;
  };
  questions: QuizQuestion[] | [];
  createdAt: string; // ISO string
}

// GET /api/v1/quizzes/:id
export interface GetQuizByIdResponse extends CreateQuizResponse {}

// GET /api/v1/quizzes/
export type GetAllQuizzesResponse = CreateQuizResponse[];
