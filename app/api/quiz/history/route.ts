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
import type { QuizAttempt, QuizDifficulty, QuizQuestionType } from "@/lib/types";

interface QuizHistoryItem extends QuizAttempt {
  quiz: {
    title: string;
    difficulty: QuizDifficulty;
    questionCount: number;
    questionTypes: QuizQuestionType[];
    sourceDocumentIds: string[];
  };
}

interface QuizHistoryResponse {
  success: boolean;
  data?: {
    attempts: QuizHistoryItem[];
    summary: {
      totalAttempts: number;
      averageScore: number;
      improvementTrend: 'improving' | 'declining' | 'stable';
    };
  };
  error?: string;
}

/**
 * Fetches quiz history with quiz details
 */
async function fetchQuizHistory(): Promise<QuizHistoryResponse['data']> {
  const client = await getAuthenticatedSupabaseClient();

  // Fetch quiz attempts with quiz details
  const { data: attemptsData, error: attemptsError } = await client
    .from('quiz_attempts')
    .select(`
      *,
      quizzes!inner (
        title,
        difficulty,
        question_count,
        question_types,
        source_document_ids
      )
    `)
    .order('completed_at', { ascending: false });

  if (attemptsError) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to fetch quiz history: ${attemptsError.message}`
    );
  }

  if (!attemptsData) {
    return {
      attempts: [],
      summary: {
        totalAttempts: 0,
        averageScore: 0,
        improvementTrend: 'stable',
      },
    };
  }

  // Transform data to match TypeScript interfaces
  const attempts: QuizHistoryItem[] = attemptsData.map(attempt => ({
    id: attempt.id,
    quizId: attempt.quiz_id,
    userId: attempt.user_id,
    answers: attempt.answers,
    score: attempt.score,
    totalQuestions: attempt.total_questions,
    timeTaken: attempt.time_taken,
    completedAt: attempt.completed_at,
    quiz: {
      title: attempt.quizzes.title,
      difficulty: attempt.quizzes.difficulty,
      questionCount: attempt.quizzes.question_count,
      questionTypes: attempt.quizzes.question_types,
      sourceDocumentIds: attempt.quizzes.source_document_ids || [],
    },
  }));

  // Calculate summary statistics
  const totalAttempts = attempts.length;
  const averageScore = totalAttempts > 0 
    ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / totalAttempts)
    : 0;

  // Calculate improvement trend (compare recent vs older attempts)
  let improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';
  if (totalAttempts >= 6) {
    const recentAttempts = attempts.slice(0, 3);
    const olderAttempts = attempts.slice(3, 6);
    
    const recentAvg = recentAttempts.reduce((sum, a) => sum + a.score, 0) / recentAttempts.length;
    const olderAvg = olderAttempts.reduce((sum, a) => sum + a.score, 0) / olderAttempts.length;
    
    if (recentAvg > olderAvg + 5) improvementTrend = 'improving';
    else if (recentAvg < olderAvg - 5) improvementTrend = 'declining';
  }

  return {
    attempts,
    summary: {
      totalAttempts,
      averageScore,
      improvementTrend,
    },
  };
}

// GET handler for quiz history
async function handleGET(request: NextRequest): Promise<NextResponse<QuizHistoryResponse>> {
  const context = extractRequestContext(request, '/api/quiz/history');

  // Authentication validation
  const authContext = await requireAuthentication(request, ['read']);
  const userId = authContext.userId;

  console.log(`📚 Fetching quiz history for user ${userId}`);

  try {
    const data = await fetchQuizHistory();

    console.log(`✅ Quiz history fetched successfully:`);
    console.log(`   - Total attempts: ${data.attempts.length}`);
    console.log(`   - Average score: ${data.summary.averageScore}%`);
    console.log(`   - Trend: ${data.summary.improvementTrend}`);

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
      `Failed to fetch quiz history: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { ...context, userId },
      error instanceof Error ? error : undefined
    );
  }
}

// Export the wrapped handler
export const GET = withErrorHandling(
  handleGET,
  { endpoint: '/api/quiz/history', method: 'GET' }
);