"use client";

import React from "react";
import { InteractiveQuizPlayer } from "@/components/quiz/InteractiveQuizPlayer";
import { Quiz, QuizQuestion, QuizAttempt } from "@/lib/types";

export default function QuizPlayerTestPage() {
  const mockQuiz: Quiz = {
    id: 'quiz-1',
    userId: 'user-1',
    title: 'Test Quiz - Interactive Player Demo',
    sourceDocumentIds: ['doc-1'],
    questionCount: 3,
    difficulty: 'medium',
    questionTypes: ['mcq', 'truefalse', 'fillblank'],
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
      questionText: 'What is the capital of France?',
      questionType: 'mcq',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 'Paris',
      explanation: 'Paris is the capital and largest city of France, located in the north-central part of the country.',
      difficulty: 'easy',
      orderIndex: 0,
      sourceChunks: ['chunk-1'],
      sourcePages: [1, 2],
      confidenceScore: 0.95,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'q2',
      quizId: 'quiz-1',
      questionText: 'The Earth is flat.',
      questionType: 'truefalse',
      correctAnswer: 'False',
      explanation: 'The Earth is approximately spherical in shape, not flat. This has been scientifically proven through various methods.',
      difficulty: 'easy',
      orderIndex: 1,
      sourceChunks: ['chunk-2'],
      sourcePages: [3],
      confidenceScore: 0.98,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'q3',
      quizId: 'quiz-1',
      questionText: 'The chemical symbol for water is ____.',
      questionType: 'fillblank',
      correctAnswer: 'H2O',
      explanation: 'Water is composed of two hydrogen atoms and one oxygen atom, giving it the chemical formula H2O.',
      difficulty: 'medium',
      orderIndex: 2,
      sourceChunks: ['chunk-3'],
      sourcePages: [4, 5],
      confidenceScore: 0.92,
      createdAt: '2024-01-01T00:00:00Z',
    },
  ];

  const handleQuizComplete = async (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => {
    console.log('Quiz completed:', attempt);
    alert(`Quiz completed! Score: ${attempt.score}%`);
  };

  const handleExit = () => {
    console.log('Exiting quiz');
    alert('Quiz exited');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Interactive Quiz Player Demo</h1>
        <p className="text-muted-foreground mt-2">
          This is a test page for the InteractiveQuizPlayer component with sample data.
        </p>
      </div>

      <InteractiveQuizPlayer
        quiz={mockQuiz}
        questions={mockQuestions}
        onComplete={handleQuizComplete}
        onExit={handleExit}
      />
    </div>
  );
}