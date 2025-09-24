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
import type { Quiz, QuizQuestion, QuizAttempt } from "@/lib/types";

interface QuizDetailsResponse {
  success: boolean;
  data?: {
    quiz: Quiz;
    questions: QuizQuestion[];
    attempts: QuizAttempt[];
    statistics: {
      totalAttempts: number;
      averageScore: number;
      bestScore: number;
      lastAttempt: string | null;
    };
  };
  error?: string;
}

/**
 * Validates quiz ID format
 */
function validateQuizId(quizId: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(quizId)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      `Invalid quiz ID format: ${quizId}`
    );
  }
}

/**
 * Fetches quiz details with questions and attempts
 */
async function fetchQuizDetails(quizId: string): Promise<QuizDetailsResponse['data']> {
  const client = await getAuthenticatedSupabaseClient();

  // Fetch quiz
  const { data: quizData, error: quizError } = await client
    .from('quizzes')
    .select('*')
    .eq('id', quizId)
    .single();

  if (quizError) {
    if (quizError.code === 'PGRST116') {
      throw createServerError(
        ServerErrorType.NOT_FOUND_ERROR,
        `Quiz not found: ${quizId}`
      );
    }
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to fetch quiz: ${quizError.message}`
    );
  }

  // Fetch questions
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

  // Fetch attempts
  const { data: attemptsData, error: attemptsError } = await client
    .from('quiz_attempts')
    .select('*')
    .eq('quiz_id', quizId)
    .order('completed_at', { ascending: false });

  if (attemptsError) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to fetch quiz attempts: ${attemptsError.message}`
    );
  }

  // Calculate statistics
  const attempts = attemptsData || [];
  const statistics = {
    totalAttempts: attempts.length,
    averageScore: attempts.length > 0 
      ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length)
      : 0,
    bestScore: attempts.length > 0 
      ? Math.max(...attempts.map(attempt => attempt.score))
      : 0,
    lastAttempt: attempts.length > 0 ? attempts[0].completed_at : null,
  };

  // Transform data to match TypeScript interfaces
  const quiz: Quiz = {
    id: quizData.id,
    userId: quizData.user_id,
    title: quizData.title,
    sourceDocumentIds: quizData.source_document_ids || quizData.source_pdf_ids || [],
    pageRange: quizData.page_range,
    questionCount: quizData.question_count,
    difficulty: quizData.difficulty,
    questionTypes: quizData.question_types,
    notes: quizData.notes,
    focusAreas: quizData.focus_areas,
    learningObjectives: quizData.learning_objectives,
    generationMethod: quizData.generation_method || 'rag',
    metadata: quizData.metadata || {},
    createdAt: quizData.created_at,
    updatedAt: quizData.updated_at,
  };

  const questions: QuizQuestion[] = (questionsData || []).map(q => ({
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

  const quizAttempts: QuizAttempt[] = attempts.map(a => ({
    id: a.id,
    quizId: a.quiz_id,
    userId: a.user_id,
    answers: a.answers,
    score: a.score,
    totalQuestions: a.total_questions,
    timeTaken: a.time_taken,
    completedAt: a.completed_at,
  }));

  return {
    quiz,
    questions,
    attempts: quizAttempts,
    statistics,
  };
}

// GET handler for quiz details
async function handleGET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<QuizDetailsResponse>> {
  const context = extractRequestContext(request, `/api/quiz/${params.id}`);

  // Authentication validation
  const authContext = await requireAuthentication(request, ['read']);
  const userId = authContext.userId;

  // Validate quiz ID
  validateQuizId(params.id);

  console.log(`📋 Fetching quiz details for quiz ${params.id} by user ${userId}`);

  try {
    const data = await fetchQuizDetails(params.id);

    console.log(`✅ Quiz details fetched successfully:`);
    console.log(`   - Quiz: ${data.quiz.title}`);
    console.log(`   - Questions: ${data.questions.length}`);
    console.log(`   - Attempts: ${data.attempts.length}`);
    console.log(`   - Best Score: ${data.statistics.bestScore}%`);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('ServerError')) {
      throw error;
    }
    
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to fetch quiz details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { ...context, userId, quizId: params.id },
      error instanceof Error ? error : undefined
    );
  }
}

interface QuizUpdateRequest {
  title?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionTypes?: ('mcq' | 'truefalse' | 'fillblank')[];
  notes?: string;
  focusAreas?: string[];
  learningObjectives?: string[];
}

interface QuizUpdateResponse {
  success: boolean;
  data?: Quiz;
  error?: string;
}

interface QuizDeleteResponse {
  success: boolean;
  error?: string;
}

/**
 * Validates quiz update request
 */
function validateQuizUpdateRequest(request: QuizUpdateRequest): void {
  if (request.difficulty && !['easy', 'medium', 'hard'].includes(request.difficulty)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      `Invalid difficulty level: ${request.difficulty}`
    );
  }

  if (request.questionTypes) {
    if (!Array.isArray(request.questionTypes) || request.questionTypes.length === 0) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        'Question types must be a non-empty array'
      );
    }

    const validTypes = ['mcq', 'truefalse', 'fillblank'];
    const invalidTypes = request.questionTypes.filter(type => !validTypes.includes(type));
    if (invalidTypes.length > 0) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        `Invalid question types: ${invalidTypes.join(', ')}`
      );
    }
  }

  if (request.title !== undefined && typeof request.title !== 'string') {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Title must be a string'
    );
  }

  if (request.notes !== undefined && typeof request.notes !== 'string') {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Notes must be a string'
    );
  }

  if (request.focusAreas !== undefined && !Array.isArray(request.focusAreas)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Focus areas must be an array'
    );
  }

  if (request.learningObjectives !== undefined && !Array.isArray(request.learningObjectives)) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Learning objectives must be an array'
    );
  }
}

/**
 * Updates quiz in database
 */
async function updateQuiz(quizId: string, updates: QuizUpdateRequest): Promise<Quiz> {
  const client = await getAuthenticatedSupabaseClient();

  // Build update object with snake_case field names
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty;
  if (updates.questionTypes !== undefined) updateData.question_types = updates.questionTypes;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.focusAreas !== undefined) updateData.focus_areas = updates.focusAreas;
  if (updates.learningObjectives !== undefined) updateData.learning_objectives = updates.learningObjectives;

  const { data: quizData, error: quizError } = await client
    .from('quizzes')
    .update(updateData)
    .eq('id', quizId)
    .select('*')
    .single();

  if (quizError) {
    if (quizError.code === 'PGRST116') {
      throw createServerError(
        ServerErrorType.NOT_FOUND_ERROR,
        `Quiz not found: ${quizId}`
      );
    }
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to update quiz: ${quizError.message}`
    );
  }

  // Transform data to match TypeScript interface
  const quiz: Quiz = {
    id: quizData.id,
    userId: quizData.user_id,
    title: quizData.title,
    sourceDocumentIds: quizData.source_document_ids || [],
    pageRange: quizData.page_range,
    questionCount: quizData.question_count,
    difficulty: quizData.difficulty,
    questionTypes: quizData.question_types,
    notes: quizData.notes,
    focusAreas: quizData.focus_areas,
    learningObjectives: quizData.learning_objectives,
    generationMethod: quizData.generation_method || 'rag',
    metadata: quizData.metadata || {},
    createdAt: quizData.created_at,
    updatedAt: quizData.updated_at,
  };

  return quiz;
}

/**
 * Deletes quiz and all associated data
 */
async function deleteQuiz(quizId: string): Promise<void> {
  const client = await getAuthenticatedSupabaseClient();

  // Check if quiz exists and user has permission (RLS will handle this)
  const { data: quizData, error: checkError } = await client
    .from('quizzes')
    .select('id')
    .eq('id', quizId)
    .single();

  if (checkError) {
    if (checkError.code === 'PGRST116') {
      throw createServerError(
        ServerErrorType.NOT_FOUND_ERROR,
        `Quiz not found: ${quizId}`
      );
    }
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to check quiz existence: ${checkError.message}`
    );
  }

  // Delete quiz (cascade will handle questions and attempts)
  const { error: deleteError } = await client
    .from('quizzes')
    .delete()
    .eq('id', quizId);

  if (deleteError) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to delete quiz: ${deleteError.message}`
    );
  }
}

// PUT handler for quiz updates
async function handlePUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<QuizUpdateResponse>> {
  const context = extractRequestContext(request, `/api/quiz/${params.id}`);

  // Authentication validation
  const authContext = await requireAuthentication(request, ['write']);
  const userId = authContext.userId;

  // Validate quiz ID
  validateQuizId(params.id);

  // Parse and validate request body
  let requestData: QuizUpdateRequest;
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
  validateQuizUpdateRequest(requestData);

  console.log(`📝 Updating quiz ${params.id} for user ${userId}`);
  console.log(`   - Updates: ${JSON.stringify(requestData, null, 2)}`);

  try {
    const updatedQuiz = await updateQuiz(params.id, requestData);

    console.log(`✅ Quiz updated successfully:`);
    console.log(`   - Quiz: ${updatedQuiz.title}`);
    console.log(`   - Difficulty: ${updatedQuiz.difficulty}`);
    console.log(`   - Question Types: ${updatedQuiz.questionTypes.join(', ')}`);

    return NextResponse.json({
      success: true,
      data: updatedQuiz,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('ServerError')) {
      throw error;
    }
    
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to update quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { ...context, userId, quizId: params.id, requestData },
      error instanceof Error ? error : undefined
    );
  }
}

// DELETE handler for quiz deletion
async function handleDELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<QuizDeleteResponse>> {
  const context = extractRequestContext(request, `/api/quiz/${params.id}`);

  // Authentication validation
  const authContext = await requireAuthentication(request, ['write']);
  const userId = authContext.userId;

  // Validate quiz ID
  validateQuizId(params.id);

  console.log(`🗑️ Deleting quiz ${params.id} for user ${userId}`);

  try {
    await deleteQuiz(params.id);

    console.log(`✅ Quiz deleted successfully: ${params.id}`);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('ServerError')) {
      throw error;
    }
    
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to delete quiz: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { ...context, userId, quizId: params.id },
      error instanceof Error ? error : undefined
    );
  }
}

// Export the wrapped handlers
export const GET = withErrorHandling(
  handleGET,
  { endpoint: '/api/quiz/[id]', method: 'GET' }
);

export const PUT = withErrorHandling(
  handlePUT,
  { endpoint: '/api/quiz/[id]', method: 'PUT' }
);

export const DELETE = withErrorHandling(
  handleDELETE,
  { endpoint: '/api/quiz/[id]', method: 'DELETE' }
);