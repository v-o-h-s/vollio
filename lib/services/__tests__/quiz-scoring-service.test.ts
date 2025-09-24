/**
 * Tests for QuizScoringService
 */

import { describe, it, expect } from 'vitest';
import { QuizScoringService } from '../quiz-scoring-service';
import { QuizQuestion, QuizQuestionType } from '@/lib/types';

describe('QuizScoringService', () => {
  const scoringService = new QuizScoringService();

  const mockQuestions: QuizQuestion[] = [
    {
      id: '1',
      quizId: 'quiz-1',
      questionText: 'What is 2 + 2?',
      questionType: 'mcq' as QuizQuestionType,
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
      explanation: 'Basic addition: 2 + 2 = 4',
      difficulty: 'easy',
      orderIndex: 0,
      sourceChunks: [],
      sourcePages: [1],
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      quizId: 'quiz-1',
      questionText: 'The Earth is flat.',
      questionType: 'truefalse' as QuizQuestionType,
      correctAnswer: 'False',
      explanation: 'The Earth is approximately spherical.',
      difficulty: 'easy',
      orderIndex: 1,
      sourceChunks: [],
      sourcePages: [2],
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '3',
      quizId: 'quiz-1',
      questionText: 'Fill in the blank: The capital of France is ____.',
      questionType: 'fillblank' as QuizQuestionType,
      correctAnswer: 'Paris',
      explanation: 'Paris is the capital and largest city of France.',
      difficulty: 'medium',
      orderIndex: 2,
      sourceChunks: [],
      sourcePages: [3],
      createdAt: '2024-01-01T00:00:00Z',
    },
  ];

  describe('calculateResults', () => {
    it('should calculate perfect score for all correct answers', () => {
      const userAnswers = {
        '1': '4',
        '2': 'False',
        '3': 'Paris',
      };

      const results = scoringService.calculateResults(mockQuestions, userAnswers, 120);

      expect(results.totalScore).toBe(100);
      expect(results.correctAnswers).toBe(3);
      expect(results.totalQuestions).toBe(3);
      expect(results.timeTaken).toBe(120);
      expect(results.questionResults).toHaveLength(3);
      expect(results.questionResults.every(r => r.isCorrect)).toBe(true);
    });

    it('should calculate partial score for mixed answers', () => {
      const userAnswers = {
        '1': '4',     // Correct
        '2': 'True',  // Incorrect
        '3': 'paris', // Correct (case insensitive)
      };

      const results = scoringService.calculateResults(mockQuestions, userAnswers, 180);

      expect(results.correctAnswers).toBe(2);
      expect(results.totalQuestions).toBe(3);
      expect(results.questionResults[0].isCorrect).toBe(true);
      expect(results.questionResults[1].isCorrect).toBe(false);
      expect(results.questionResults[2].isCorrect).toBe(true);
    });

    it('should handle empty answers', () => {
      const userAnswers = {
        '1': '',
        '2': '',
        '3': '',
      };

      const results = scoringService.calculateResults(mockQuestions, userAnswers);

      expect(results.totalScore).toBe(0);
      expect(results.correctAnswers).toBe(0);
      expect(results.questionResults.every(r => !r.isCorrect)).toBe(true);
    });

    it('should apply difficulty weighting when enabled', () => {
      const userAnswers = {
        '1': '4',     // Easy question - correct
        '2': 'False', // Easy question - correct  
        '3': 'Paris', // Medium question - correct
      };

      const results = scoringService.calculateResults(
        mockQuestions, 
        userAnswers, 
        undefined, 
        { difficultyWeighting: true }
      );

      // Medium question should have higher points than easy questions
      const mediumResult = results.questionResults.find(r => r.difficulty === 'medium');
      const easyResult = results.questionResults.find(r => r.difficulty === 'easy');
      
      expect(mediumResult?.maxPoints).toBeGreaterThan(easyResult?.maxPoints || 0);
    });

    it('should provide analytics breakdown', () => {
      const userAnswers = {
        '1': '4',     // Easy MCQ - correct
        '2': 'True',  // Easy True/False - incorrect
        '3': 'Paris', // Medium Fill-blank - correct
      };

      const results = scoringService.calculateResults(mockQuestions, userAnswers);

      expect(results.analytics.difficultyBreakdown).toHaveProperty('easy');
      expect(results.analytics.difficultyBreakdown).toHaveProperty('medium');
      expect(results.analytics.questionTypeBreakdown).toHaveProperty('mcq');
      expect(results.analytics.questionTypeBreakdown).toHaveProperty('truefalse');
      expect(results.analytics.questionTypeBreakdown).toHaveProperty('fillblank');

      // Check easy difficulty: 1 correct out of 2
      expect(results.analytics.difficultyBreakdown.easy.correct).toBe(1);
      expect(results.analytics.difficultyBreakdown.easy.total).toBe(2);

      // Check medium difficulty: 1 correct out of 1
      expect(results.analytics.difficultyBreakdown.medium.correct).toBe(1);
      expect(results.analytics.difficultyBreakdown.medium.total).toBe(1);
    });
  });

  describe('validateAttempt', () => {
    it('should validate complete attempt', () => {
      const userAnswers = {
        '1': '4',
        '2': 'False',
        '3': 'Paris',
      };

      const validation = scoringService.validateAttempt(mockQuestions, userAnswers);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing answers', () => {
      const userAnswers = {
        '1': '4',
        // Missing answers for questions 2 and 3
      };

      const validation = scoringService.validateAttempt(mockQuestions, userAnswers);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should detect invalid question IDs', () => {
      const userAnswers = {
        '1': '4',
        '2': 'False',
        '3': 'Paris',
        'invalid-id': 'some answer',
      };

      const validation = scoringService.validateAttempt(mockQuestions, userAnswers);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Invalid question ID'))).toBe(true);
    });
  });

  describe('createAttemptRecord', () => {
    it('should create proper attempt record', () => {
      const userAnswers = {
        '1': '4',
        '2': 'False',
        '3': 'Paris',
      };

      const results = scoringService.calculateResults(mockQuestions, userAnswers, 120);
      const attemptRecord = scoringService.createAttemptRecord('quiz-1', 'user-1', results);

      expect(attemptRecord.quizId).toBe('quiz-1');
      expect(attemptRecord.userId).toBe('user-1');
      expect(attemptRecord.answers).toEqual(userAnswers);
      expect(attemptRecord.score).toBe(results.totalScore);
      expect(attemptRecord.totalQuestions).toBe(results.totalQuestions);
      expect(attemptRecord.timeTaken).toBe(120);
    });
  });

  describe('fill-in-blank partial credit', () => {
    it('should award partial credit for similar answers', () => {
      const question: QuizQuestion = {
        id: '1',
        quizId: 'quiz-1',
        questionText: 'What is the capital of France?',
        questionType: 'fillblank' as QuizQuestionType,
        correctAnswer: 'Paris',
        explanation: 'Paris is the capital of France.',
        difficulty: 'easy',
        orderIndex: 0,
        sourceChunks: [],
        sourcePages: [1],
        createdAt: '2024-01-01T00:00:00Z',
      };

      // Test close but not exact answers
      const testCases = [
        { answer: 'paris', expectedCorrect: true },      // Case difference
        { answer: 'Paris ', expectedCorrect: true },     // Extra whitespace
        { answer: 'Pari', expectedCorrect: true },       // Close enough for partial credit (similarity > 0.8)
        { answer: 'London', expectedCorrect: false },    // Completely wrong
      ];

      testCases.forEach(({ answer, expectedCorrect }) => {
        const results = scoringService.calculateResults(
          [question], 
          { '1': answer }, 
          undefined,
          { partialCredit: true, caseSensitive: false }
        );

        expect(results.questionResults[0].isCorrect).toBe(expectedCorrect);
      });
    });
  });
});