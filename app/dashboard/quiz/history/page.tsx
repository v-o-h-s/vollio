"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorNotification } from "@/components/ui/error-notification";
import { 
  QuizHistoryList, 
  QuizReviewMode, 
  QuizRetakeInterface 
} from "@/components/quiz";
import { Quiz } from "@/lib/types";
import { 
  ArrowLeft, 
  BookOpen, 
  History, 
  RefreshCw,
  TrendingUp
} from "lucide-react";

type ViewMode = 'history' | 'review' | 'retake';

interface ViewState {
  mode: ViewMode;
  attemptId?: string;
  quiz?: Quiz;
}

export default function QuizHistoryPage() {
  const router = useRouter();
  const [viewState, setViewState] = useState<ViewState>({ mode: 'history' });

  // Handle viewing a specific quiz attempt
  const handleViewAttempt = (attemptId: string, quiz: Quiz) => {
    setViewState({
      mode: 'review',
      attemptId,
      quiz,
    });
  };

  // Handle retaking a quiz
  const handleRetakeQuiz = (quizId: string) => {
    // For now, we'll need to fetch the quiz details
    // In a real implementation, you might want to pass the full quiz object
    // or fetch it in the retake component
    router.push(`/dashboard/quiz/${quizId}/retake`);
  };

  // Handle viewing quiz details
  const handleViewQuiz = (quizId: string) => {
    router.push(`/dashboard/quiz/${quizId}`);
  };

  // Handle starting retake from review mode
  const handleStartRetake = () => {
    if (viewState.quiz) {
      setViewState({
        mode: 'retake',
        quiz: viewState.quiz,
      });
    }
  };

  // Handle quiz generation completion
  const handleQuizGenerated = (newQuizId: string) => {
    router.push(`/dashboard/quiz/${newQuizId}`);
  };

  // Handle back navigation
  const handleBack = () => {
    if (viewState.mode === 'review' || viewState.mode === 'retake') {
      setViewState({ mode: 'history' });
    } else {
      router.push('/dashboard/quiz');
    }
  };

  // Render page header based on current view
  const renderHeader = () => {
    switch (viewState.mode) {
      case 'review':
        return (
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Quiz Review</h1>
              <p className="text-muted-foreground">
                Detailed review of your quiz attempt
              </p>
            </div>
          </div>
        );
      
      case 'retake':
        return (
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Retake Quiz</h1>
              <p className="text-muted-foreground">
                Generate new questions and improve your score
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <History className="h-8 w-8" />
                Quiz History
              </h1>
              <p className="text-muted-foreground">
                Review your past quiz attempts and track your progress
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/quiz')}
                className="flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Generate New Quiz
              </Button>
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        );
    }
  };

  // Render main content based on current view
  const renderContent = () => {
    switch (viewState.mode) {
      case 'review':
        if (!viewState.attemptId || !viewState.quiz) {
          return (
            <ErrorNotification
              title="Invalid Review State"
              message="Unable to load quiz review. Please try again."
              onRetry={handleBack}
            />
          );
        }
        
        return (
          <QuizReviewMode
            attemptId={viewState.attemptId}
            quiz={viewState.quiz}
            onRetakeQuiz={handleStartRetake}
            onBackToHistory={handleBack}
          />
        );
      
      case 'retake':
        if (!viewState.quiz) {
          return (
            <ErrorNotification
              title="Invalid Retake State"
              message="Unable to load quiz retake. Please try again."
              onRetry={handleBack}
            />
          );
        }
        
        return (
          <QuizRetakeInterface
            originalQuiz={viewState.quiz}
            onQuizGenerated={handleQuizGenerated}
            onCancel={handleBack}
          />
        );
      
      default:
        return (
          <QuizHistoryList
            onViewAttempt={handleViewAttempt}
            onRetakeQuiz={handleRetakeQuiz}
            onViewQuiz={handleViewQuiz}
          />
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {renderHeader()}
      {renderContent()}
    </div>
  );
}