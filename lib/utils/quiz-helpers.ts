/**
 * Quiz helper functions and utilities
 * This file validates that our quiz types are properly defined
 */

import type {
  Quiz,
  QuizQuestion,
  QuizAttempt,
  QuizMetadata,
  QuizDifficulty,
  QuizQuestionType,
} from "@/lib/types";

import type {
  QuizRow,
  QuizQuestionRow,
  QuizAttemptRow,
} from "@/lib/types/database";
/**
 * Maps a database quiz row to the application Quiz interface
 */
export function mapQuizRowToQuiz(row: QuizRow): Quiz {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    sourcePdfIds: row.source_pdf_ids,
    questionCount: row.question_count,
    difficulty: row.difficulty as QuizDifficulty,
    questionTypes: row.question_types as QuizQuestionType[],
    metadata: row.metadata as QuizMetadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Maps a database quiz question row to the application QuizQuestion interface
 */
export function mapQuizQuestionRowToQuizQuestion(
  row: QuizQuestionRow
): QuizQuestion {
  return {
    id: row.id,
    quizId: row.quiz_id,
    questionText: row.question_text,
    questionType: row.question_type as QuizQuestionType,
    options: row.options as string[] | undefined,
    correctAnswer: row.correct_answer,
    explanation: row.explanation,
    difficulty: row.difficulty as QuizDifficulty,
    orderIndex: row.order_index,
    createdAt: row.created_at,
  };
}

/**
 * Maps a database quiz attempt row to the application QuizAttempt interface
 */
export function mapQuizAttemptRowToQuizAttempt(
  row: QuizAttemptRow
): QuizAttempt {
  return {
    id: row.id,
    quizId: row.quiz_id,
    userId: row.user_id,
    answers: row.answers as Record<string, string>,
    score: row.score,
    totalQuestions: row.total_questions,
    timeTaken: row.time_taken || undefined,
    completedAt: row.completed_at,
  };
}

/**
 * Validates quiz configuration parameters
 */
export function validateQuizConfiguration(config: {
  questionCount: number;
  difficulty: string;
  questionTypes: string[];
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate question count
  if (config.questionCount < 1 || config.questionCount > 50) {
    errors.push("Question count must be between 1 and 50");
  }

  // Validate difficulty
  const validDifficulties: QuizDifficulty[] = ["easy", "medium", "hard"];
  if (!validDifficulties.includes(config.difficulty as QuizDifficulty)) {
    errors.push("Difficulty must be easy, medium, or hard");
  }

  // Validate question types
  const validQuestionTypes: QuizQuestionType[] = ["mcq", "truefalse"];
  if (config.questionTypes.length === 0) {
    errors.push("At least one question type must be selected");
  }

  for (const type of config.questionTypes) {
    if (!validQuestionTypes.includes(type as QuizQuestionType)) {
      errors.push(`Invalid question type: ${type}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates quiz score as a percentage
 */
export function calculateQuizScore(
  answers: Record<string, string>,
  questions: QuizQuestion[]
): { score: number; correctAnswers: number; totalQuestions: number } {
  let correctAnswers = 0;
  const totalQuestions = questions.length;

  for (const question of questions) {
    const userAnswer = answers[question.id];
    if (userAnswer === question.correctAnswer) {
      correctAnswers++;
    }
  }

  const score =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  return {
    score,
    correctAnswers,
    totalQuestions,
  };
}

/**
 * Generates a default quiz metadata object
 */
export function createDefaultQuizMetadata(
  sourceDocumentTitles: string[],
  extractionMethod: "pdfjs" | "ocr" = "pdfjs",
  generationTime: number = 0,
  aiModel: string = "gpt-3.5-turbo"
): QuizMetadata {
  return {
    sourceDocumentTitles,
    extractionMethod,
    generationTime,
    aiModel,
  };
}

/**
 * Type guard to check if a value is a valid QuizDifficulty
 */
export function isValidQuizDifficulty(value: string): value is QuizDifficulty {
  return ["easy", "medium", "hard"].includes(value);
}

/**
 * Type guard to check if a value is a valid QuizQuestionType
 */
export function isValidQuizQuestionType(
  value: string
): value is QuizQuestionType {
  return ["mcq", "truefalse"].includes(value);
}
