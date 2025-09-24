"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { ResponsiveQuizPlayer } from "@/components/quiz/ResponsiveQuizPlayer";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorNotification } from "@/components/ui/error-notification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetQuizQuery, useSubmitQuizAttemptMutation } from "@/lib/store/apiSlice";
import { Quiz, QuizQuestion, QuizAttempt } from "@/lib/types";
import { ArrowLeft, Trophy, Clock, Target, BookOpen } from "lucide-react";

export default function QuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const {
    data: quizData,
    isLoading,
    error,
    refetch,
  } = useGetQuizQuery(quizId);

  const [submitAttempt, { isLoading: isSubmitting }] = useSubmitQuizAttemptMutation();

  const handleQuizComplete = async (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => {
    try {
      const result = await submitAttempt({
        quizId: attempt.quizId,
        answers: attempt.answers,
        timeTaken: attempt.timeTaken,
      }).unwrap();

      console.log('Quiz attempt submitted successfully:', result);
      
      // Show success message or navigate to results
      // For now, we'll stay on the same page to show results
    } catch (error) {
      console.error('Failed to submit quiz attempt:', error);
      throw error; // Let the InteractiveQuizPlayer handle the error display
    }
  };

  const handleExitQuiz = () => {
    router.push('/dashboard/quiz');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-muted-foreground">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <ErrorNotification
            title="Failed to Load Quiz"
            message="Unable to load the quiz. Please try again."
            onRetry={refetch}
          />
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={handleExitQuiz}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quizzes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!quizData || !quizData.questions || quizData.questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Quiz Not Available
              </CardTitle>
              <CardDescription>
                This quiz doesn't have any questions or is not accessible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Button variant="outline" onClick={handleExitQuiz}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Quizzes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Transform the data to match our component interfaces
  const quiz: Quiz = {
    id: quizData.quiz.id,
    userId: quizData.quiz.user_id || quizData.quiz.userId,
    title: quizData.quiz.title,
    sourceDocumentIds: quizData.quiz.source_document_ids || quizData.quiz.sourceDocumentIds || [],
    pageRange: quizData.quiz.page_range || quizData.quiz.pageRange,
    questionCount: quizData.quiz.question_count || quizData.quiz.questionCount,
    difficulty: quizData.quiz.difficulty,
    questionTypes: quizData.quiz.question_types || quizData.quiz.questionTypes || [],
    notes: quizData.quiz.notes,
    focusAreas: quizData.quiz.focus_areas || quizData.quiz.focusAreas,
    learningObjectives: quizData.quiz.learning_objectives || quizData.quiz.learningObjectives,
    generationMethod: quizData.quiz.generation_method || quizData.quiz.generationMethod || 'rag',
    metadata: quizData.quiz.metadata || {},
    createdAt: quizData.quiz.created_at || quizData.quiz.createdAt,
    updatedAt: quizData.quiz.updated_at || quizData.quiz.updatedAt,
  };

  const questions: QuizQuestion[] = quizData.questions.map(q => ({
    id: q.id,
    quizId: q.quiz_id || q.quizId,
    questionText: q.question_text || q.questionText,
    questionType: q.question_type || q.questionType,
    options: q.options,
    correctAnswer: q.correct_answer || q.correctAnswer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    orderIndex: q.order_index || q.orderIndex,
    sourceChunks: q.source_chunks || q.sourceChunks || [],
    sourcePages: q.source_pages || q.sourcePages || [],
    confidenceScore: q.confidence_score || q.confidenceScore,
    createdAt: q.created_at || q.createdAt,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Quiz Statistics Header (shown before starting) */}
      {quizData.statistics && quizData.statistics.totalAttempts > 0 && (
        <div className="max-w-4xl mx-auto mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Your Quiz History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {quizData.statistics.totalAttempts}
                  </div>
                  <div className="text-sm text-muted-foreground">Attempts</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {quizData.statistics.bestScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">Best Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {quizData.statistics.averageScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">Average</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {questions.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Responsive Quiz Player */}
      <ResponsiveQuizPlayer
        quiz={quiz}
        questions={questions}
        onComplete={handleQuizComplete}
        onExit={handleExitQuiz}
        className="max-w-4xl mx-auto"
      />

      {/* Mobile-specific back button */}
      <div className="md:hidden fixed bottom-4 left-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExitQuiz}
          className="shadow-lg"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}