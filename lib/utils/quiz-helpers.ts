/**
 * Quiz helper functions and utilities
 * This file validates that our quiz types are properly defined
 */

import type {
  Quiz,
  RAGQuizMetadata ,
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
  DocumentProcessingStatus,
  ChunkReference,
} from "@/lib/types/database";
/**
 * Maps a database quiz row to the application Quiz interface
 */   
export function mapQuizRowToQuiz(row: QuizRow): Quiz {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    sourceDocumentIds: row.source_pdf_ids,
    questionCount: row.question_count,
    difficulty: row.difficulty as QuizDifficulty,
    questionTypes: row.question_types as QuizQuestionType[],
    notes: row.notes || undefined,
    generationMethod: (row.generation_method as 'rag' | 'simple') || 'simple',
    metadata: row.metadata as RAGQuizMetadata,
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
    sourceChunks: row.source_chunks || [],
    sourcePages: row.source_pages || [],
    confidenceScore: row.confidence_score || undefined,
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
 * Validates RAG quiz configuration parameters
 */
export function validateQuizConfiguration(config: {
  questionCount: number;
  difficulty: string;
  questionTypes: string[];
  pageRange?: { start: number; end: number };
  notes?: string;
  focusAreas?: string[];
  learningObjectives?: string[];
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
  const validQuestionTypes: QuizQuestionType[] = ["mcq", "truefalse", "fillblank"];
  if (config.questionTypes.length === 0) {
    errors.push("At least one question type must be selected");
  }

  for (const type of config.questionTypes) {
    if (!validQuestionTypes.includes(type as QuizQuestionType)) {
      errors.push(`Invalid question type: ${type}`);
    }
  }

  // Validate page range (optional)
  if (config.pageRange) {
    if (config.pageRange.start < 1) {
      errors.push("Page range start must be at least 1");
    }
    if (config.pageRange.end < config.pageRange.start) {
      errors.push("Page range end must be greater than or equal to start");
    }
    if (config.pageRange.end > 10000) {
      errors.push("Page range end cannot exceed 10000");
    }
  }

  // Validate notes (optional)
  if (config.notes && config.notes.length > 1000) {
    errors.push("Notes must be 1000 characters or less");
  }

  // Validate focus areas (optional)
  if (config.focusAreas && config.focusAreas.length > 10) {
    errors.push("Maximum 10 focus areas allowed");
  }

  // Validate learning objectives (optional)
  if (config.learningObjectives && config.learningObjectives.length > 10) {
    errors.push("Maximum 10 learning objectives allowed");
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
 * Generates a default RAG quiz metadata object
 */
export function createDefaultRAGQuizMetadata(
  sourceDocumentTitles: string[],
  totalChunksSearched: number = 0,
  averageRelevanceScore: number = 0,
  generationTime: number = 0,
  aiModel: string = "gpt-4",
  embeddingModel: string = "text-embedding-ada-002",
  searchQuery: string = "",
  retrievalMethod: "vector_similarity" | "hybrid" = "vector_similarity"
): RAGQuizMetadata {
  return {
    sourceDocumentTitles,
    totalChunksSearched,
    averageRelevanceScore,
    generationTime,
    aiModel,
    embeddingModel,
    searchQuery,
    retrievalMethod,
  };
}

/**
 * Generates a default quiz metadata object (legacy)
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
  return ["mcq", "truefalse", "fillblank"].includes(value);
}

/**
 * Processes user notes to extract context for AI generation
 */
export function processNotesForAI(notes?: string): {
  focusAreas: string[];
  instructions: string[];
  context: string;
} {
  if (!notes || notes.trim().length === 0) {
    return {
      focusAreas: [],
      instructions: [],
      context: "",
    };
  }

  const cleanNotes = notes.trim();
  const focusAreas: string[] = [];
  const instructions: string[] = [];

  // Extract focus areas (lines starting with "focus on", "emphasize", etc.)
  const focusKeywords = ["focus on", "emphasize", "concentrate on", "highlight"];
  const instructionKeywords = ["make sure", "ensure", "avoid", "don't include", "exclude"];

  const lines = cleanNotes.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (focusKeywords.some(keyword => lowerLine.includes(keyword))) {
      focusAreas.push(line);
    } else if (instructionKeywords.some(keyword => lowerLine.includes(keyword))) {
      instructions.push(line);
    }
  }

  return {
    focusAreas,
    instructions,
    context: cleanNotes,
  };
}

/**
 * Validates notes content for appropriate length and content
 */
export function validateNotes(notes?: string): { valid: boolean; error?: string } {
  if (!notes) {
    return { valid: true };
  }

  const trimmedNotes = notes.trim();
  
  if (trimmedNotes.length === 0) {
    return { valid: true };
  }

  if (trimmedNotes.length > 1000) {
    return { 
      valid: false, 
      error: "Notes must be 1000 characters or less" 
    };
  }

  // Check for potentially problematic content
  const problematicPatterns = [
    /\b(hack|exploit|malicious|harmful)\b/i,
    /\b(generate|create)\s+(inappropriate|offensive|harmful)\b/i,
  ];

  for (const pattern of problematicPatterns) {
    if (pattern.test(trimmedNotes)) {
      return { 
        valid: false, 
        error: "Notes contain inappropriate content" 
      };
    }
  }

  return { valid: true };
}

/**
 * Constructs a search query from quiz parameters for RAG retrieval
 */
export function constructSearchQuery(config: {
  notes?: string;
  focusAreas?: string[];
  learningObjectives?: string[];
  difficulty: QuizDifficulty;
  questionTypes: QuizQuestionType[];
}): string {
  const queryParts: string[] = [];

  // Add notes as primary context
  if (config.notes && config.notes.trim()) {
    queryParts.push(config.notes.trim());
  }

  // Add focus areas
  if (config.focusAreas && config.focusAreas.length > 0) {
    queryParts.push(`Focus on: ${config.focusAreas.join(", ")}`);
  }

  // Add learning objectives
  if (config.learningObjectives && config.learningObjectives.length > 0) {
    queryParts.push(`Learning objectives: ${config.learningObjectives.join(", ")}`);
  }

  // Add difficulty context
  const difficultyContext = {
    easy: "basic concepts and fundamental understanding",
    medium: "intermediate concepts and application",
    hard: "advanced concepts and complex analysis"
  };
  queryParts.push(`Generate ${difficultyContext[config.difficulty]} questions`);

  // Add question type context
  const questionTypeContext = {
    mcq: "multiple choice questions with clear options",
    truefalse: "true/false statements that can be definitively answered",
    fillblank: "fill-in-the-blank questions testing key terms and concepts"
  };
  
  const typeDescriptions = config.questionTypes.map(type => questionTypeContext[type]);
  queryParts.push(`Question types: ${typeDescriptions.join(", ")}`);

  return queryParts.join(". ");
}

/**
 * Validates document processing status for quiz generation
 */
export function validateDocumentReadiness(
  processingStatuses: DocumentProcessingStatus[]
): { ready: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (processingStatuses.length === 0) {
    errors.push("No documents selected for quiz generation");
    return { ready: false, errors, warnings };
  }

  for (const status of processingStatuses) {
    if (status.status === 'failed') {
      errors.push(`Document processing failed: ${status.errorMessage || 'Unknown error'}`);
    } else if (status.status === 'processing') {
      warnings.push(`Document is still being processed (${status.processedChunks}/${status.totalChunks} chunks)`);
    } else if (status.status === 'pending') {
      warnings.push("Document processing has not started yet");
    } else if (status.totalChunks === 0) {
      warnings.push("Document contains no processable content");
    }
  }

  const ready = errors.length === 0 && processingStatuses.every(s => s.status === 'completed');
  
  return { ready, errors, warnings };
}

/**
 * Calculates relevance score statistics from chunk references
 */
export function calculateRelevanceStats(chunks: ChunkReference[]): {
  averageScore: number;
  minScore: number;
  maxScore: number;
  totalChunks: number;
} {
  if (chunks.length === 0) {
    return { averageScore: 0, minScore: 0, maxScore: 0, totalChunks: 0 };
  }

  const scores = chunks.map(chunk => chunk.relevanceScore);
  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  return {
    averageScore: Math.round(averageScore * 10000) / 10000, // Round to 4 decimal places
    minScore,
    maxScore,
    totalChunks: chunks.length,
  };
}
