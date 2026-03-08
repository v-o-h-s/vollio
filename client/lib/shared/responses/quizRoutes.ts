import {
  DifficultyLevel,
  ExplanationLevel,
  QuizLanguage,
  QuizQuestion,
} from "../requests/quizRequests";

// POST /api/v1/quizzes (data)
export interface CreateQuizResponse {
  id: string;
  title: string | null;
  documentId: string;
  language: QuizLanguage;
  settings: {
    difficultyLevel: DifficultyLevel | null;
    numberOfQuestions: number | null;
    explanationLevel: ExplanationLevel;
  };
  questions: QuizQuestion[] | [];
  createdAt: string;
}

// GET /api/v1/quizzes/:id
export interface GetQuizByIdResponse extends CreateQuizResponse {}

// GET /api/v1/quizzes/
export type GetAllQuizzesResponse = CreateQuizResponse[];
