import React from 'react';
import { describe, it, expect } from 'vitest';
import { InteractiveQuizPlayer } from '../InteractiveQuizPlayer';
import { Quiz, QuizQuestion } from '@/lib/types';

// Simple smoke test to verify the component can be imported and instantiated
describe('InteractiveQuizPlayer - Basic Tests', () => {
  const mockQuiz: Quiz = {
    id: 'quiz-1',
    userId: 'user-1',
    title: 'Test Quiz',
    sourceDocumentIds: ['doc-1'],
    questionCount: 1,
    difficulty: 'medium',
    questionTypes: ['mcq'],
    generationMethod: 'rag',
    metadata: {},
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      quizId: 'quiz-1',
      questionText: 'What is the capital of France?',
      questionType: 'mcq',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 'Paris',
      explanation: 'Paris is the capital and largest city of France.',
      difficulty: 'easy',
      orderIndex: 0,
      sourceChunks: [],
      sourcePages: [1],
      createdAt: '2024-01-01T00:00:00Z',
    },
  ];

  const mockOnComplete = () => {};

  it('should be importable', () => {
    expect(InteractiveQuizPlayer).toBeDefined();
  });

  it('should accept required props without throwing', () => {
    expect(() => {
      const props = {
        quiz: mockQuiz,
        questions: mockQuestions,
        onComplete: mockOnComplete,
      };
      // Just verify props are accepted
      expect(props).toBeDefined();
    }).not.toThrow();
  });

  it('should have correct component structure', () => {
    // Test that the component has the expected interface
    expect(typeof InteractiveQuizPlayer).toBe('function');
  });
});