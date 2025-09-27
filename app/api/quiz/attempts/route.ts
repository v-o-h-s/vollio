import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  withErrorHandling,
  extractRequestContext,
  createServerError,
  ServerErrorType,
} from "@/lib/utils/server-error-handling";
import {
  requireAuthentication,
} from "@/lib/utils/auth-validation";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { quizScoringService, type QuizResults } from "@/lib/services/quiz-scoring-service";
import type { QuizAttempt, QuizQuestion } from "@/lib/types";

interface QuizAttemptRequest {
  quizId: string;
  answers: Record<string, string>;
  timeTaken?: number;
}

interface QuizAttemptResponse {
  success: boolean;
  data?: {
    attemptId: string;
    results: QuizResults;
  };
  error?: string;
}

/**
 * Validates quiz attempt request
 */
function validateQuizAttemptRequest(request: QuizAttemptRequest): void {
  // Quiz ID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(request.quizId)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      `Invalid quiz ID format: ${request.quizId}`
    );
  }

  // Answers validation
  if (!request.answers || typeof request.answers !== 'object') {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Answers must be provided as an object'
    );
  }

  if (Object.keys(request.answers).length === 0) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'At least one answer must be provided'
    );
  }

  // Time taken validation
  if (request.timeTaken !== undefined) {
    if (typeof request.timeTaken !== 'number' || request.timeTaken < 0) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        'Time taken must be a non-negative number'
      );
    }

    if (request.timeTaken > 86400) { // 24 hours max
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        'Time taken cannot exceed 24 hours'
      );
    }
  }
}

/**
 * Fetches quiz questions for scoring
 */
async function fetchQuizQuestions(quizId: string): Promise<QuizQuestion[]> {
  const client = await getAuthenticatedSupabaseClient();

  const { data: questionsData, error: questionsError } = await client
    .from('quiz_questions')
    .select('*')
    .eq('quiz_id', quizId)
    .order('order_index', { ascending: true });

  if (questionsError) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to fetch quiz questions: ${questionsError.message}`
    );
  }

  if (!questionsData || questionsData.length === 0) {
    throw createServerError(
      ServerErrorType.NOT_FOUND_ERROR,
      `No questions found for quiz: ${quizId}`
    );
  }

  return questionsData.map(q => ({
    id: q.id,
    quizId: q.quiz_id,
    questionText: q.question_text,
    questionType: q.question_type,
    options: q.options,
    correctAnswer: q.correct_answer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    orderIndex: q.order_index,
    sourceChunks: q.source_chunks || [],
    sourcePages: q.source_pages || [],
    confidenceScore: q.confidence_score,
    createdAt: q.created_at,
  }));
}

/**
 * Validates quiz attempt answers against questions
 */
function validateQuizAnswers(
  questions: QuizQuestion[],
  answers: Record<string, string>
): void {
  // Validate that all questions have answers
  const missingAnswers = questions.filter(q => !answers[q.id]);
  if (missingAnswers.length > 0) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      `Missing answers for ${missingAnswers.length} question(s)`
    );
  }

  // Use the scoring service validation
  const validation = quizScoringService.validateAttempt(questions, answers);
  if (!validation.valid) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      `Invalid quiz attempt: ${validation.errors.join(', ')}`
    );
  }
}

/**
 * Stores quiz attempt in database using scoring service
 */
async function storeQuizAttempt(
  quizId: string,
  userId: string,
  results: Omit<QuizResults, 'attemptId' | 'quizId' | 'userId' | 'completedAt'>
): Promise<string> {
  const client = await getAuthenticatedSupabaseClient();

  // Create attempt record using scoring service
  const attemptRecord = quizScoringService.createAttemptRecord(quizId, userId, results);

  const { data: attemptData, error: attemptError } = await client
    .from('quiz_attempts')
    .insert({
      quiz_id: attemptRecord.quizId,
      user_id: attemptRecord.userId,
      answers: attemptRecord.answers,
      score: attemptRecord.score,
      total_questions: attemptRecord.totalQuestions,
      time_taken: attemptRecord.timeTaken,
    })
    .select('id')
    .single();

  if (attemptError) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to store quiz attempt: ${attemptError.message}`
    );
  }

  return attemptData.id;
}

// POST handler for quiz attempt submission
async function handlePOST(request: NextRequest): Promise<NextResponse<QuizAttemptResponse>> {
  const context = extractRequestContext(request, '/api/quiz/attempts');

  // Authentication validation
  const authContext = await requireAuthentication(request, ['write']);
  const userId = authContext.userId;

  // Parse and validate request body
  let requestData: QuizAttemptRequest;
  try {
    requestData = await request.json();
  } catch (error) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Invalid JSON in request body',
      { ...context, userId }
    );
  }

  // Validate request parameters
  validateQuizAttemptRequest(requestData);

  console.log(`📝 Processing quiz attempt submission:`);
  console.log(`   - Quiz ID: ${requestData.quizId}`);
  console.log(`   - User: ${userId}`);
  console.log(`   - Answers: ${Object.keys(requestData.answers).length}`);
  console.log(`   - Time taken: ${requestData.timeTaken || 'not provided'}s`);

  try {
    // Fetch quiz questions
    const questions = await fetchQuizQuestions(requestData.quizId);

    // Validate quiz answers
    validateQuizAnswers(questions, requestData.answers);

    // Calculate comprehensive results using scoring service
    const scoringResults = quizScoringService.calculateResults(
      questions,
      requestData.answers,
      requestData.timeTaken,
      {
        partialCredit: true,
        difficultyWeighting: true,
        caseSensitive: false,
      }
    );

    // Store attempt
    const attemptId = await storeQuizAttempt(requestData.quizId, userId, scoringResults);

    // Create complete results object
    const completeResults: QuizResults = {
      ...scoringResults,
      attemptId,
      quizId: requestData.quizId,
      userId,
      completedAt: new Date().toISOString(),
    };

    console.log(`✅ Quiz attempt submitted successfully:`);
    console.log(`   - Attempt ID: ${attemptId}`);
    console.log(`   - Score: ${completeResults.totalScore}%`);
    console.log(`   - Correct: ${completeResults.correctAnswers}/${completeResults.totalQuestions}`);
    // Removed analytics logging to keep it simple

    const response: QuizAttemptResponse = {
      success: true,
      data: {
        attemptId,
        results: completeResults,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('ServerError')) {
      throw error;
    }
    
    throw createServerError(
      ServerErrorType.PROCESSING_ERROR,
      `Failed to process quiz attempt: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { ...context, userId, requestData },
      error instanceof Error ? error : undefined
    );
  }
}

// Export the wrapped handler
export const POST = withErrorHandling(
  handlePOST,
  { endpoint: '/api/quiz/attempts', method: 'POST' }
);