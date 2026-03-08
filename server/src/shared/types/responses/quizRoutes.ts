import {
  DifficultyLevel,
  ExplanationLevel,
  QuizLanguage,
} from "../requests/quizRequests";
import { QuizQuestion } from "../requests/quizRequests"; // Need to add QuizQuestion to quizRequests or move it

// POST /api/v1/quizzes  (data)
export interface CreateQuizResponse {
  id: string; // quiz UUID
  title: string | null;
  documentId: string;
  language: QuizLanguage;
  settings: {
    difficultyLevel: DifficultyLevel | null;
    numberOfQuestions: number | null;

    explanationLevel: ExplanationLevel;
  };
  questions: QuizQuestion[] | [];
  createdAt: string; // ISO string
}

// GET /api/v1/quizzes/:id
export interface GetQuizByIdResponse extends CreateQuizResponse {}

// GET /api/v1/quizzes/
export type GetAllQuizzesResponse = CreateQuizResponse[];
