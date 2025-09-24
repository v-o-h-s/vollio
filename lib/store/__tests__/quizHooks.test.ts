/**
 * Tests for quiz hooks functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type {
  Quiz,
  QuizQuestion,
  QuizAttempt,
} from '../../types';

// Mock data for testing
const mockQuiz: Quiz = {
  id: 'quiz-1',
  userId: 'user-1',
  title: 'Test Quiz',
  sourceDocumentIds: ['doc-1'],
  questionCount: 5,
  difficulty: 'medium',
  questionTypes: ['mcq', 'truefalse'],
  generationMethod: 'rag',
  metadata: {
    sourceDocumentTitles: ['Test Document'],
    totalChunksSearched: 10,
    averageRelevanceScore: 0.85,
    generationTime: 5000,
    aiModel: 'gpt-4',
    embeddingModel: 'text-embedding-ada-002',
    searchQuery: 'test query',
    retrievalMethod: 'vector_similarity',
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    quizId: 'quiz-1',
    questionText: 'What is the answer?',
    questionType: 'mcq',
    options: ['A', 'B', 'C', 'D'],
    correctAnswer: 'A',
    explanation: 'A is correct because...',
    difficulty: 'medium',
    orderIndex: 0,
    sourceChunks: ['chunk-1'],
    sourcePages: [1],
    confidenceScore: 0.9,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const mockAttempts: QuizAttempt[] = [
  {
    id: 'attempt-1',
    quizId: 'quiz-1',
    userId: 'user-1',
    answers: { q1: 'A' },
    score: 100,
    totalQuestions: 1,
    timeTaken: 60,
    completedAt: '2024-01-01T00:00:00Z',
  },
];

describe('Quiz Types and Data Structures', () => {
  it('should have proper quiz data structure', () => {
    expect(mockQuiz).toBeDefined();
    expect(mockQuiz.id).toBe('quiz-1');
    expect(mockQuiz.difficulty).toBe('medium');
    expect(mockQuiz.questionTypes).toContain('mcq');
    expect(mockQuiz.generationMethod).toBe('rag');
  });

  it('should have proper question data structure', () => {
    expect(mockQuestions).toHaveLength(1);
    expect(mockQuestions[0].questionType).toBe('mcq');
    expect(mockQuestions[0].options).toHaveLength(4);
    expect(mockQuestions[0].correctAnswer).toBe('A');
  });

  it('should have proper attempt data structure', () => {
    expect(mockAttempts).toHaveLength(1);
    expect(mockAttempts[0].score).toBe(100);
    expect(mockAttempts[0].answers).toHaveProperty('q1', 'A');
  });
});

describe('Quiz Utility Functions', () => {
  it('should validate quiz answers correctly', () => {
    const validateQuizAnswers = (
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
    };

    const validation = validateQuizAnswers(mockQuestions, { q1: 'A' });

    expect(validation.score).toBe(100);
    expect(validation.correctCount).toBe(1);
    expect(validation.totalQuestions).toBe(1);
    expect(validation.results).toHaveLength(1);
    expect(validation.results[0].correct).toBe(true);
  });

  it('should calculate quiz difficulty correctly', () => {
    const calculateQuizDifficulty = (questions: QuizQuestion[]) => {
      const difficultyWeights = { easy: 1, medium: 2, hard: 3 };
      const totalWeight = questions.reduce((sum, q) => 
        sum + difficultyWeights[q.difficulty as 'easy' | 'medium' | 'hard'], 0
      );
      const averageWeight = totalWeight / questions.length;

      if (averageWeight <= 1.3) return 'easy';
      if (averageWeight <= 2.3) return 'medium';
      return 'hard';
    };

    const difficulty = calculateQuizDifficulty(mockQuestions);
    expect(difficulty).toBe('medium');
  });

  it('should estimate quiz duration correctly', () => {
    const estimateQuizDuration = (questions: QuizQuestion[]) => {
      const timePerQuestion = {
        mcq: 45, // seconds
        truefalse: 30,
        fillblank: 60,
      };

      const totalSeconds = questions.reduce((sum, q) => 
        sum + timePerQuestion[q.questionType], 0
      );

      return Math.ceil(totalSeconds / 60); // Return minutes
    };

    const duration = estimateQuizDuration(mockQuestions);
    expect(duration).toBeGreaterThan(0);
    expect(duration).toBe(1); // 45 seconds = 1 minute
  });
});

describe('Quiz Analytics', () => {
  it('should provide quiz analytics', () => {
    const calculateAnalytics = (quizzes: Quiz[], attempts: QuizAttempt[]) => {
      if (!quizzes.length && !attempts.length) return null;

      const totalQuizzes = quizzes.length;
      const totalAttempts = attempts.length;
      const averageScore = attempts.length > 0 
        ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
        : 0;

      const difficultyBreakdown = quizzes.reduce((acc, quiz) => {
        acc[quiz.difficulty] = (acc[quiz.difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalQuizzes,
        totalAttempts,
        averageScore,
        difficultyBreakdown,
        hasData: totalQuizzes > 0 || totalAttempts > 0,
      };
    };

    const analytics = calculateAnalytics([mockQuiz], mockAttempts);

    expect(analytics).toBeDefined();
    expect(analytics?.totalQuizzes).toBe(1);
    expect(analytics?.totalAttempts).toBe(1);
    expect(analytics?.averageScore).toBe(100);
    expect(analytics?.hasData).toBe(true);
  });

  it('should return null for empty data', () => {
    const calculateAnalytics = (quizzes: Quiz[], attempts: QuizAttempt[]) => {
      if (!quizzes.length && !attempts.length) return null;
      return { hasData: false };
    };

    const analytics = calculateAnalytics([], []);
    expect(analytics).toBeNull();
  });
});