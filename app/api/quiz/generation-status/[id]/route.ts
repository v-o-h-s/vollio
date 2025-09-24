import { NextRequest, NextResponse } from "next/server";
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

interface GenerationStatusResponse {
  success: boolean;
  data: {
    quizId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number; // 0-100
    currentStep?: string;
    estimatedTimeRemaining?: number; // seconds
    error?: string;
    createdAt: string;
    completedAt?: string;
  };
}

// GET handler for quiz generation status
async function handleGET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<GenerationStatusResponse>> {
  const context = extractRequestContext(request, `/api/quiz/generation-status/${params.id}`);
  const quizId = params.id;

  // Authentication validation
  const authContext = await requireAuthentication(request, ['read']);
  const userId = authContext.userId;

  if (!quizId) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      'Quiz ID is required',
      { ...context, userId }
    );
  }

  try {
    const client = await getAuthenticatedSupabaseClient();

    // Check if quiz exists and get its status
    const { data: quiz, error: quizError } = await client
      .from('quizzes')
      .select('id, created_at, updated_at, metadata')
      .eq('id', quizId)
      .single();

    if (quizError) {
      if (quizError.code === 'PGRST116') {
        throw createServerError(
          ServerErrorType.NOT_FOUND,
          `Quiz with ID ${quizId} not found`,
          { ...context, userId, quizId }
        );
      }
      throw createServerError(
        ServerErrorType.DATABASE_ERROR,
        `Failed to fetch quiz status: ${quizError.message}`,
        { ...context, userId, quizId },
        quizError
      );
    }

    // Check if quiz has questions (indicates completion)
    const { data: questions, error: questionsError } = await client
      .from('quiz_questions')
      .select('id')
      .eq('quiz_id', quizId);

    if (questionsError) {
      throw createServerError(
        ServerErrorType.DATABASE_ERROR,
        `Failed to check quiz questions: ${questionsError.message}`,
        { ...context, userId, quizId },
        questionsError
      );
    }

    // Determine status based on quiz existence and questions
    let status: 'pending' | 'processing' | 'completed' | 'failed' = 'processing';
    let progress = 50; // Default progress for existing quiz
    let currentStep = 'Generating questions';
    let estimatedTimeRemaining: number | undefined;

    if (questions && questions.length > 0) {
      status = 'completed';
      progress = 100;
      currentStep = 'Completed';
      estimatedTimeRemaining = 0;
    } else {
      // Quiz exists but no questions yet - still processing
      const createdAt = new Date(quiz.created_at);
      const now = new Date();
      const elapsedMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
      
      if (elapsedMinutes > 10) {
        // If it's been more than 10 minutes, likely failed
        status = 'failed';
        progress = 0;
        currentStep = 'Generation failed';
      } else {
        // Estimate progress based on elapsed time (rough estimate)
        progress = Math.min(90, Math.floor((elapsedMinutes / 5) * 100));
        estimatedTimeRemaining = Math.max(0, 300 - (elapsedMinutes * 60)); // 5 min max
      }
    }

    const response: GenerationStatusResponse = {
      success: true,
      data: {
        quizId,
        status,
        progress,
        currentStep,
        estimatedTimeRemaining,
        createdAt: quiz.created_at,
        completedAt: status === 'completed' ? quiz.updated_at : undefined
      }
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('ServerError')) {
      throw error;
    }
    
    throw createServerError(
      ServerErrorType.PROCESSING_ERROR,
      `Failed to get quiz generation status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { ...context, userId, quizId },
      error instanceof Error ? error : undefined
    );
  }
}

// Export the wrapped handler
export const GET = withErrorHandling(
  handleGET,
  { endpoint: '/api/quiz/generation-status/[id]', method: 'GET' }
);