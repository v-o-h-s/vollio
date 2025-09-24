"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InteractiveQuizPlayer } from "./InteractiveQuizPlayer";
import { QuizResultsDisplay } from "./QuizResultsDisplay";
import { useSubmitQuizAttemptMutation } from "@/lib/store/apiSlice";
import { Quiz, QuizQuestion } from "@/lib/types";
import { QuizResults } from "@/lib/services/quiz-scoring-service";

/**
 * Example component demonstrating the complete quiz scoring workflow
 * This shows how to integrate InteractiveQuizPlayer with QuizResultsDisplay
 * and the new scoring system.
 */
export function QuizScoringExample() {
  const [currentView, setCurrentView] = useState<'quiz' | 'results'>('quiz');
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  const [submitQuizAttempt, { isLoading: isSubmitting }] = useSubmitQuizAttemptMutation();

  // Example quiz data
  const exampleQuiz: Quiz = {
    id: 'example-quiz-1',
    userId: 'user-1',
    title: 'Sample Quiz: Basic Knowledge',
    sourceDocumentIds: ['doc-1'],
    questionCount: 3,
    difficulty: 'easy',
    questionTypes: ['mcq', 'truefalse', 'fillblank'],
    generationMethod: 'rag',
    metadata: {
      sourceDocumentTitles: ['Sample Document'],
      totalChunksSearched: 10,
      averageRelevanceScore: 0.85,
      generationTime: 2500,
      aiModel: 'gpt-4',
      embeddingModel: 'text-embedding-ada-002',
      searchQuery: 'basic knowledge test',
      retrievalMethod: 'vector_similarity',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const exampleQuestions: QuizQuestion[] = [
    {
      id: 'q1',
      quizId: 'example-quiz-1',
      questionText: 'What is the capital of France?',
      questionType: 'mcq',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correctAnswer: 'Paris',
      explanation: 'Paris is the capital and most populous city of France.',
      difficulty: 'easy',
      orderIndex: 0,
      sourceChunks: ['chunk-1'],
      sourcePages: [1],
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'q2',
      quizId: 'example-quiz-1',
      questionText: 'The Earth is flat.',
      questionType: 'truefalse',
      correctAnswer: 'False',
      explanation: 'The Earth is approximately spherical, not flat. This has been scientifically proven.',
      difficulty: 'easy',
      orderIndex: 1,
      sourceChunks: ['chunk-2'],
      sourcePages: [2],
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'q3',
      quizId: 'example-quiz-1',
      questionText: 'Fill in the blank: Water boils at ___ degrees Celsius.',
      questionType: 'fillblank',
      correctAnswer: '100',
      explanation: 'Water boils at 100 degrees Celsius (212 degrees Fahrenheit) at standard atmospheric pressure.',
      difficulty: 'medium',
      orderIndex: 2,
      sourceChunks: ['chunk-3'],
      sourcePages: [3],
      createdAt: '2024-01-01T00:00:00Z',
    },
  ];

  // Handle quiz completion
  const handleQuizComplete = async (results: QuizResults) => {
    try {
      // Submit to API using RTK Query
      const response = await submitQuizAttempt({
        quizId: results.quizId,
        answers: results.questionResults.reduce((acc, result) => {
          acc[result.questionId] = result.userAnswer;
          return acc;
        }, {} as Record<string, string>),
        timeTaken: results.timeTaken,
      }).unwrap();

      // Use the results from the API response (which includes server-side scoring)
      setQuizResults(response.results);
      setCurrentView('results');
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      // Fallback to client-side results if API fails
      setQuizResults(results);
      setCurrentView('results');
    }
  };

  // Handle retaking the quiz
  const handleRetakeQuiz = () => {
    setQuizResults(null);
    setCurrentView('quiz');
  };

  // Handle viewing the quiz (for review)
  const handleViewQuiz = () => {
    setCurrentView('quiz');
  };

  // Handle sharing results (placeholder)
  const handleShareResults = () => {
    if (quizResults) {
      const shareText = `I scored ${quizResults.totalScore}% on "${exampleQuiz.title}"! 🎉`;
      if (navigator.share) {
        navigator.share({
          title: 'Quiz Results',
          text: shareText,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(shareText);
        alert('Results copied to clipboard!');
      }
    }
  };

  // Handle exporting results (placeholder)
  const handleExportResults = () => {
    if (quizResults) {
      const dataStr = JSON.stringify(quizResults, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quiz-results-${quizResults.quizId}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Scoring System Demo</CardTitle>
          <CardDescription>
            This example demonstrates the complete quiz scoring workflow with the new 
            QuizScoringService, including detailed analytics and results display.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={currentView === 'quiz' ? 'default' : 'outline'}
              onClick={() => setCurrentView('quiz')}
            >
              Take Quiz
            </Button>
            {quizResults && (
              <Button
                variant={currentView === 'results' ? 'default' : 'outline'}
                onClick={() => setCurrentView('results')}
              >
                View Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quiz or Results View */}
      {currentView === 'quiz' && (
        <InteractiveQuizPlayer
          quiz={exampleQuiz}
          questions={exampleQuestions}
          onComplete={handleQuizComplete}
          onExit={() => setCurrentView('quiz')}
        />
      )}

      {currentView === 'results' && quizResults && (
        <QuizResultsDisplay
          quiz={exampleQuiz}
          results={quizResults}
          onRetakeQuiz={handleRetakeQuiz}
          onViewQuiz={handleViewQuiz}
          onShareResults={handleShareResults}
          onExportResults={handleExportResults}
        />
      )}

      {/* Loading State */}
      {isSubmitting && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Submitting quiz results...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}