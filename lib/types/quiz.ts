/**
 * Quiz-related types for quiz generation and management system
 */

// ============================================================================
// QUIZ TYPES
// ============================================================================

/**
 * Quiz difficulty levels
 */
export type QuizDifficulty = "easy" | "medium" | "hard";

/**
 * Quiz question types (enhanced)
 */
export type QuizQuestionType = "mcq" | "truefalse" | "fillblank";

/**
 * RAG quiz metadata for additional information
 */
export interface RAGQuizMetadata {
  sourceDocumentTitles: string[];
  totalChunksSearched: number;
  averageRelevanceScore: number;
  generationTime: number;
  aiModel: string;
  embeddingModel: string;
  searchQuery: string;
  retrievalMethod: "vector_similarity" | "hybrid";
}

/**
 * Legacy quiz metadata (for backward compatibility)
 */
export interface QuizMetadata {
  sourceDocumentTitles: string[];
  extractionMethod: "pdfjs" | "ocr";
  generationTime: number;
  aiModel: string;
  totalTextLength?: number;
  averageQuestionComplexity?: number;
}

/**
 * Main quiz entity (enhanced for RAG)
 */
export interface Quiz {
  id: string;
  userId: string;
  title: string;
  sourceDocumentIds: string[]; // Changed from sourcePdfIds for clarity
  pageRange?: { start: number; end: number };
  questionCount: number;
  difficulty: QuizDifficulty;
  questionTypes: QuizQuestionType[];
  notes?: string; // User-provided context and instructions for quiz generation
  focusAreas?: string[];
  learningObjectives?: string[];
  generationMethod: "rag" | "simple";
  metadata: RAGQuizMetadata;
  createdAt: string; // ISO string for Redux serialization
  updatedAt: string; // ISO string for Redux serialization
}

/**
 * Individual quiz question (enhanced for RAG)
 */
export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  questionType: QuizQuestionType;
  options?: string[]; // For MCQ questions (4 options)
  correctAnswer: string;
  explanation: string;
  difficulty: QuizDifficulty;
  orderIndex: number;
  sourceChunks: string[]; // References to document chunks used
  sourcePages: number[]; // Page numbers where content was sourced
  confidenceScore?: number; // AI confidence in question quality (0.00-1.00)
  createdAt: string; // ISO string for Redux serialization
}

/**
 * Quiz attempt/result record
 */
export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: Record<string, string>; // questionId -> selectedAnswer
  score: number; // Percentage (0-100)
  totalQuestions: number;
  timeTaken?: number; // in seconds
  completedAt: string; // ISO string for Redux serialization
}

/**
 * Quiz configuration for generation (enhanced)
 */
export interface QuizConfiguration {
  questionCount: number;
  difficulty: QuizDifficulty;
  questionTypes: QuizQuestionType[];
  pageRange?: { start: number; end: number };
  notes?: string; // User-provided context and instructions
  focusAreas?: string[];
  learningObjectives?: string[];
  includeDiagrams?: boolean;
  excludeTopics?: string[];
}

// ============================================================================
// QUIZ API TYPES
// ============================================================================

/**
 * RAG quiz generation request payload
 */
export interface RAGQuizGenerationRequest {
  documentIds: string[];
  pageRange?: { start: number; end: number };
  questionCount: number;
  difficulty: QuizDifficulty;
  questionTypes: QuizQuestionType[];
  notes?: string;
  focusAreas?: string[];
  learningObjectives?: string[];
}

/**
 * Legacy quiz generation request (for backward compatibility)
 */
export interface QuizGenerationRequest {
  text: string;
  questionCount: number;
  difficulty: QuizDifficulty;
  questionTypes: QuizQuestionType[];
  sourceDocuments: string[];
  title?: string;
  notes?: string; // Additional context and instructions from user
}

/**
 * Quiz generation response
 */
export interface QuizGenerationResponse {
  success: boolean;
  quizId: string;
  questions: QuizQuestion[];
  metadata: QuizMetadata;
  error?: string;
}

/**
 * Quiz attempt submission request
 */
export interface QuizAttemptRequest {
  quizId: string;
  answers: Record<string, string>;
  timeTaken?: number;
}

/**
 * Quiz attempt submission response
 */
export interface QuizAttemptResponse {
  success: boolean;
  attemptId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  results: Array<{
    questionId: string;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
    explanation: string;
  }>;
  error?: string;
}

/**
 * Quiz list response with pagination
 */
export interface QuizListResponse {
  success: boolean;
  data?: {
    quizzes: Quiz[];
    totalCount: number;
  };
  error?: string;
}

/**
 * Quiz details response with questions
 */
export interface QuizDetailsResponse {
  success: boolean;
  data?: {
    quiz: Quiz;
    questions: QuizQuestion[];
  };
  error?: string;
}
