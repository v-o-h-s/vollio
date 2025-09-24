/**
 * Typed hooks for quiz operations with enhanced functionality
 * Provides better developer experience and additional utilities
 */

import { useCallback, useMemo } from 'react';
import { 
  useGenerateQuizMutation,
  useGetQuizzesQuery,
  useGetQuizQuery,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
  useSubmitQuizAttemptMutation,
  useGetQuizHistoryQuery,
  useProcessDocumentMutation,
  useGetProcessingStatusQuery,
  useSearchContentMutation,
  useGetQuizGenerationStatusQuery,
} from './apiSlice';
import type {
  Quiz,
  QuizQuestion,
  QuizAttempt,
  QuizDifficulty,
  QuizQuestionType,
  RAGQuizGenerationRequest,
  ContentSearchRequest,
  DocumentProcessingRequest,
} from '../types';

// ============================================================================
// QUIZ GENERATION HOOKS
// ============================================================================

/**
 * Enhanced hook for quiz generation with optimistic updates and progress tracking
 */
export function useQuizGeneration() {
  const [generateQuiz, { 
    isLoading: isGenerating, 
    error: generationError,
    data: generationResult 
  }] = useGenerateQuizMutation();

  const generateQuizWithProgress = useCallback(async (
    request: RAGQuizGenerationRequest & { title?: string }
  ) => {
    try {
      const result = await generateQuiz(request).unwrap();
      return {
        success: true,
        quizId: result.quizId,
        questions: result.questions,
        metadata: result.metadata,
        sourceChunks: result.sourceChunks,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.userMessage || error.message || 'Failed to generate quiz',
      };
    }
  }, [generateQuiz]);

  return {
    generateQuiz: generateQuizWithProgress,
    isGenerating,
    generationError,
    generationResult,
  };
}

/**
 * Hook for document processing with status tracking
 */
export function useDocumentProcessing() {
  const [processDocument, { 
    isLoading: isProcessing, 
    error: processingError 
  }] = useProcessDocumentMutation();

  const processDocumentWithTracking = useCallback(async (
    request: DocumentProcessingRequest
  ) => {
    try {
      const result = await processDocument(request).unwrap();
      return {
        success: true,
        jobId: result.jobId,
        documentId: result.documentId,
        status: result.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.userMessage || error.message || 'Failed to process document',
      };
    }
  }, [processDocument]);

  return {
    processDocument: processDocumentWithTracking,
    isProcessing,
    processingError,
  };
}

/**
 * Hook for content search with caching
 */
export function useContentSearch() {
  const [searchContent, { 
    isLoading: isSearching, 
    error: searchError,
    data: searchResults 
  }] = useSearchContentMutation();

  const searchWithCache = useCallback(async (request: ContentSearchRequest) => {
    try {
      const result = await searchContent(request).unwrap();
      return {
        success: true,
        chunks: result.chunks,
        totalResults: result.totalResults,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.userMessage || error.message || 'Failed to search content',
      };
    }
  }, [searchContent]);

  return {
    searchContent: searchWithCache,
    isSearching,
    searchError,
    searchResults,
  };
}

// ============================================================================
// QUIZ MANAGEMENT HOOKS
// ============================================================================

/**
 * Enhanced hook for quiz list with filtering and sorting
 */
export function useQuizList(options?: {
  page?: number;
  limit?: number;
  difficulty?: QuizDifficulty;
  questionType?: QuizQuestionType;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'difficulty';
  sortOrder?: 'asc' | 'desc';
}) {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetQuizzesQuery(options);

  const quizzes = useMemo(() => data?.quizzes || [], [data?.quizzes]);
  const totalCount = useMemo(() => data?.totalCount || 0, [data?.totalCount]);
  const statistics = useMemo(() => data?.statistics, [data?.statistics]);

  // Computed statistics
  const computedStats = useMemo(() => {
    if (!statistics) return null;

    return {
      ...statistics,
      hasQuizzes: statistics.totalQuizzes > 0,
      averageScoreFormatted: `${statistics.averageScore.toFixed(1)}%`,
      bestScoreFormatted: `${statistics.bestScore.toFixed(1)}%`,
      mostPopularDifficulty: Object.entries(statistics.difficultyBreakdown)
        .reduce((a, b) => a[1] > b[1] ? a : b)?.[0] as QuizDifficulty,
      mostPopularQuestionType: Object.entries(statistics.questionTypeBreakdown)
        .reduce((a, b) => a[1] > b[1] ? a : b)?.[0] as QuizQuestionType,
    };
  }, [statistics]);

  return {
    quizzes,
    totalCount,
    statistics: computedStats,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Enhanced hook for single quiz with questions and attempts
 */
export function useQuizDetails(quizId: string) {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetQuizQuery(quizId);

  const quiz = useMemo(() => data?.quiz, [data?.quiz]);
  const questions = useMemo(() => data?.questions || [], [data?.questions]);
  const attempts = useMemo(() => data?.attempts || [], [data?.attempts]);
  const statistics = useMemo(() => data?.statistics, [data?.statistics]);

  // Computed quiz analytics
  const analytics = useMemo(() => {
    if (!quiz || !questions || !attempts) return null;

    const questionTypeDistribution = questions.reduce((acc, q) => {
      acc[q.questionType] = (acc[q.questionType] || 0) + 1;
      return acc;
    }, {} as Record<QuizQuestionType, number>);

    const averageConfidence = questions
      .filter(q => q.confidenceScore)
      .reduce((sum, q) => sum + (q.confidenceScore || 0), 0) / 
      questions.filter(q => q.confidenceScore).length;

    const sourcePageRange = questions
      .flatMap(q => q.sourcePages)
      .reduce((acc, page) => ({
        min: Math.min(acc.min, page),
        max: Math.max(acc.max, page),
      }), { min: Infinity, max: -Infinity });

    return {
      questionTypeDistribution,
      averageConfidence: isNaN(averageConfidence) ? null : averageConfidence,
      sourcePageRange: sourcePageRange.min === Infinity ? null : sourcePageRange,
      hasMultipleAttempts: attempts.length > 1,
      improvementRate: attempts.length > 1 
        ? ((attempts[0].score - attempts[attempts.length - 1].score) / attempts[attempts.length - 1].score) * 100
        : null,
    };
  }, [quiz, questions, attempts]);

  return {
    quiz,
    questions,
    attempts,
    statistics,
    analytics,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for quiz operations (update, delete) with optimistic updates
 */
export function useQuizOperations() {
  const [updateQuiz, { 
    isLoading: isUpdating, 
    error: updateError 
  }] = useUpdateQuizMutation();

  const [deleteQuiz, { 
    isLoading: isDeleting, 
    error: deleteError 
  }] = useDeleteQuizMutation();

  const updateQuizWithOptimism = useCallback(async (
    id: string,
    updates: {
      title?: string;
      notes?: string;
      focusAreas?: string[];
      learningObjectives?: string[];
    }
  ) => {
    try {
      const result = await updateQuiz({ id, updates }).unwrap();
      return { success: true, quiz: result };
    } catch (error: any) {
      return {
        success: false,
        error: error.userMessage || error.message || 'Failed to update quiz',
      };
    }
  }, [updateQuiz]);

  const deleteQuizWithOptimism = useCallback(async (id: string) => {
    try {
      await deleteQuiz(id).unwrap();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.userMessage || error.message || 'Failed to delete quiz',
      };
    }
  }, [deleteQuiz]);

  return {
    updateQuiz: updateQuizWithOptimism,
    deleteQuiz: deleteQuizWithOptimism,
    isUpdating,
    isDeleting,
    updateError,
    deleteError,
  };
}

// ============================================================================
// QUIZ ATTEMPT HOOKS
// ============================================================================

/**
 * Hook for quiz attempts with detailed results
 */
export function useQuizAttempts() {
  const [submitAttempt, { 
    isLoading: isSubmitting, 
    error: submitError 
  }] = useSubmitQuizAttemptMutation();

  const submitQuizAttempt = useCallback(async (
    quizId: string,
    answers: Record<string, string>,
    timeTaken?: number
  ) => {
    try {
      const result = await submitAttempt({ quizId, answers, timeTaken }).unwrap();
      return {
        success: true,
        attemptId: result.attemptId,
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        results: result.results,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.userMessage || error.message || 'Failed to submit quiz attempt',
      };
    }
  }, [submitAttempt]);

  return {
    submitQuizAttempt,
    isSubmitting,
    submitError,
  };
}

/**
 * Enhanced hook for quiz history with analytics
 */
export function useQuizHistory(options?: {
  page?: number;
  limit?: number;
  quizId?: string;
  difficulty?: QuizDifficulty;
  dateRange?: { start: string; end: string };
}) {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useGetQuizHistoryQuery(options);

  const attempts = useMemo(() => data?.attempts || [], [data?.attempts]);
  const summary = useMemo(() => data?.summary, [data?.summary]);

  // Enhanced analytics
  const analytics = useMemo(() => {
    if (!attempts.length || !summary) return null;

    const scoreDistribution = attempts.reduce((acc, attempt) => {
      const scoreRange = Math.floor(attempt.score / 10) * 10;
      const key = `${scoreRange}-${scoreRange + 9}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const difficultyPerformance = attempts.reduce((acc, attempt) => {
      const difficulty = attempt.quiz.difficulty;
      if (!acc[difficulty]) {
        acc[difficulty] = { total: 0, sum: 0, count: 0 };
      }
      acc[difficulty].sum += attempt.score;
      acc[difficulty].count += 1;
      acc[difficulty].total = acc[difficulty].sum / acc[difficulty].count;
      return acc;
    }, {} as Record<QuizDifficulty, { total: number; sum: number; count: number }>);

    const recentTrend = attempts.slice(0, 5).map(a => a.score);
    const isImproving = recentTrend.length > 1 && 
      recentTrend[0] > recentTrend[recentTrend.length - 1];

    return {
      scoreDistribution,
      difficultyPerformance: Object.fromEntries(
        Object.entries(difficultyPerformance).map(([k, v]) => [k, v.total])
      ) as Record<QuizDifficulty, number>,
      recentTrend,
      isImproving,
      totalTimeSpent: attempts.reduce((sum, a) => sum + (a.timeTaken || 0), 0),
      averageTimePerQuestion: attempts.length > 0 
        ? attempts.reduce((sum, a) => sum + (a.timeTaken || 0), 0) / 
          attempts.reduce((sum, a) => sum + a.totalQuestions, 0)
        : 0,
    };
  }, [attempts, summary]);

  return {
    attempts,
    summary,
    analytics,
    isLoading,
    error,
    refetch,
  };
}

// ============================================================================
// STATUS TRACKING HOOKS
// ============================================================================

/**
 * Hook for tracking processing status with automatic polling
 */
export function useProcessingStatus(statusId: string | null) {
  const { 
    data, 
    isLoading, 
    error 
  } = useGetProcessingStatusQuery(statusId!, {
    skip: !statusId,
  });

  const isProcessing = useMemo(() => 
    data?.status === 'processing' || data?.status === 'pending',
    [data?.status]
  );

  const isCompleted = useMemo(() => 
    data?.status === 'completed',
    [data?.status]
  );

  const isFailed = useMemo(() => 
    data?.status === 'failed',
    [data?.status]
  );

  const progressPercentage = useMemo(() => 
    data?.progress || 0,
    [data?.progress]
  );

  return {
    status: data,
    isProcessing,
    isCompleted,
    isFailed,
    progressPercentage,
    isLoading,
    error,
  };
}

/**
 * Hook for tracking quiz generation status with automatic polling
 */
export function useQuizGenerationStatus(generationId: string | null) {
  const { 
    data, 
    isLoading, 
    error 
  } = useGetQuizGenerationStatusQuery(generationId!, {
    skip: !generationId,
  });

  const isGenerating = useMemo(() => 
    data?.status === 'processing' || data?.status === 'pending',
    [data?.status]
  );

  const isCompleted = useMemo(() => 
    data?.status === 'completed',
    [data?.status]
  );

  const isFailed = useMemo(() => 
    data?.status === 'failed',
    [data?.status]
  );

  const progressPercentage = useMemo(() => 
    data?.progress || 0,
    [data?.progress]
  );

  return {
    status: data,
    isGenerating,
    isCompleted,
    isFailed,
    progressPercentage,
    currentStep: data?.currentStep,
    estimatedTimeRemaining: data?.estimatedTimeRemaining,
    isLoading,
    error,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for quiz validation and scoring utilities
 */
export function useQuizUtils() {
  const validateQuizAnswers = useCallback((
    questions: QuizQuestion[],
    answers: Record<string, string>
  ) => {
    const results = questions.map(question => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      return {
        questionId: question.id,
        correct: isCorrect,
        userAnswer: userAnswer || '',
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      };
    });

    const correctCount = results.filter(r => r.correct).length;
    const score = (correctCount / questions.length) * 100;

    return {
      results,
      score,
      correctCount,
      totalQuestions: questions.length,
    };
  }, []);

  const calculateQuizDifficulty = useCallback((questions: QuizQuestion[]) => {
    const difficultyWeights = { easy: 1, medium: 2, hard: 3 };
    const totalWeight = questions.reduce((sum, q) => 
      sum + difficultyWeights[q.difficulty as QuizDifficulty], 0
    );
    const averageWeight = totalWeight / questions.length;

    if (averageWeight <= 1.3) return 'easy';
    if (averageWeight <= 2.3) return 'medium';
    return 'hard';
  }, []);

  const estimateQuizDuration = useCallback((questions: QuizQuestion[]) => {
    const timePerQuestion = {
      mcq: 45, // seconds
      truefalse: 30,
      fillblank: 60,
    };

    const totalSeconds = questions.reduce((sum, q) => 
      sum + timePerQuestion[q.questionType], 0
    );

    return Math.ceil(totalSeconds / 60); // Return minutes
  }, []);

  return {
    validateQuizAnswers,
    calculateQuizDifficulty,
    estimateQuizDuration,
  };
}

/**
 * Hook for quiz performance analytics
 */
export function useQuizAnalytics(quizzes: Quiz[], attempts: QuizAttempt[]) {
  const analytics = useMemo(() => {
    if (!quizzes.length && !attempts.length) return null;

    const totalQuizzes = quizzes.length;
    const totalAttempts = attempts.length;
    const averageScore = attempts.length > 0 
      ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
      : 0;

    const difficultyBreakdown = quizzes.reduce((acc, quiz) => {
      acc[quiz.difficulty] = (acc[quiz.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<QuizDifficulty, number>);

    const questionTypeBreakdown = quizzes.reduce((acc, quiz) => {
      quiz.questionTypes.forEach(type => {
        acc[type] = (acc[type] || 0) + 1;
      });
      return acc;
    }, {} as Record<QuizQuestionType, number>);

    const performanceByDifficulty = attempts.reduce((acc, attempt) => {
      // Note: We'd need quiz data joined with attempts for this
      // This is a simplified version
      return acc;
    }, {} as Record<QuizDifficulty, number[]>);

    return {
      totalQuizzes,
      totalAttempts,
      averageScore,
      difficultyBreakdown,
      questionTypeBreakdown,
      performanceByDifficulty,
      hasData: totalQuizzes > 0 || totalAttempts > 0,
    };
  }, [quizzes, attempts]);

  return analytics;
}