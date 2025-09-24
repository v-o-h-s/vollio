"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorNotification } from "@/components/ui/error-notification";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BookOpen,
  Target,
  Timer,
  Award,
  ArrowLeft,
  Calendar,
  BarChart3,
  Eye,
  RefreshCw,
  Trophy,
  Star,
  AlertCircle
} from "lucide-react";
import { Quiz, QuizQuestion, QuizAttempt, QuizQuestionType } from "@/lib/types";
import { useGetQuizDetailsQuery } from "@/lib/store/apiSlice";

interface QuizReviewModeProps {
  attemptId: string;
  quiz: Quiz;
  onRetakeQuiz?: () => void;
  onBackToHistory?: () => void;
  className?: string;
}

interface ReviewQuestion extends QuizQuestion {
  userAnswer: string;
  isCorrect: boolean;
  timeTaken?: number;
}

export function QuizReviewMode({
  attemptId,
  quiz,
  onRetakeQuiz,
  onBackToHistory,
  className
}: QuizReviewModeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showExplanations, setShowExplanations] = useState(true);

  // Fetch quiz details including questions and attempts
  const {
    data: quizDetails,
    isLoading,
    error,
    refetch
  } = useGetQuizDetailsQuery(quiz.id);

  // Find the specific attempt and prepare review data
  const reviewData = useMemo(() => {
    if (!quizDetails?.data) return null;

    const attempt = quizDetails.data.attempts.find(a => a.id === attemptId);
    if (!attempt) return null;

    const reviewQuestions: ReviewQuestion[] = quizDetails.data.questions.map(question => {
      const userAnswer = attempt.answers[question.id] || '';
      const isCorrect = userAnswer === question.correctAnswer;

      return {
        ...question,
        userAnswer,
        isCorrect,
      };
    });

    return {
      attempt,
      questions: reviewQuestions,
      quiz: quizDetails.data.quiz,
      statistics: quizDetails.data.statistics,
    };
  }, [quizDetails, attemptId]);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    if (!reviewData) return null;

    const { attempt, questions } = reviewData;
    const correctAnswers = questions.filter(q => q.isCorrect).length;
    const totalQuestions = questions.length;
    const score = attempt.score;

    let performance: 'excellent' | 'good' | 'fair' | 'needs-improvement';
    let performanceColor: string;
    let performanceIcon: React.ReactNode;

    if (score >= 90) {
      performance = 'excellent';
      performanceColor = 'text-green-600 dark:text-green-400';
      performanceIcon = <Trophy className="h-5 w-5 text-yellow-500" />;
    } else if (score >= 75) {
      performance = 'good';
      performanceColor = 'text-blue-600 dark:text-blue-400';
      performanceIcon = <Star className="h-5 w-5 text-blue-500" />;
    } else if (score >= 60) {
      performance = 'fair';
      performanceColor = 'text-yellow-600 dark:text-yellow-400';
      performanceIcon = <Target className="h-5 w-5 text-yellow-500" />;
    } else {
      performance = 'needs-improvement';
      performanceColor = 'text-red-600 dark:text-red-400';
      performanceIcon = <AlertCircle className="h-5 w-5 text-red-500" />;
    }

    // Calculate difficulty breakdown
    const difficultyBreakdown = questions.reduce((acc, question) => {
      const difficulty = question.difficulty;
      if (!acc[difficulty]) {
        acc[difficulty] = { correct: 0, total: 0 };
      }
      acc[difficulty].total++;
      if (question.isCorrect) {
        acc[difficulty].correct++;
      }
      return acc;
    }, {} as Record<string, { correct: number; total: number }>);

    // Calculate question type breakdown
    const questionTypeBreakdown = questions.reduce((acc, question) => {
      const type = question.questionType;
      if (!acc[type]) {
        acc[type] = { correct: 0, total: 0 };
      }
      acc[type].total++;
      if (question.isCorrect) {
        acc[type].correct++;
      }
      return acc;
    }, {} as Record<QuizQuestionType, { correct: number; total: number }>);

    return {
      performance,
      performanceColor,
      performanceIcon,
      correctAnswers,
      totalQuestions,
      score,
      accuracy: Math.round((correctAnswers / totalQuestions) * 100),
      averageTimePerQuestion: attempt.timeTaken ? Math.round(attempt.timeTaken / totalQuestions) : null,
      difficultyBreakdown,
      questionTypeBreakdown,
    };
  }, [reviewData]);

  const currentQuestion = reviewData?.questions[currentQuestionIndex];

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format date display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  // Get question type display name
  const getQuestionTypeDisplay = (type: QuizQuestionType): string => {
    switch (type) {
      case 'mcq': return 'Multiple Choice';
      case 'truefalse': return 'True/False';
      case 'fillblank': return 'Fill in the Blank';
      default: return type;
    }
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    if (reviewData && currentQuestionIndex < reviewData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Jump to specific question
  const handleQuestionJump = (index: number) => {
    if (reviewData && index >= 0 && index < reviewData.questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-muted-foreground">Loading quiz review...</span>
      </div>
    );
  }

  if (error || !reviewData) {
    return (
      <ErrorNotification
        title="Failed to Load Quiz Review"
        message="Unable to load the quiz review. Please try again."
        onRetry={refetch}
      />
    );
  }

  const { attempt, questions } = reviewData;

  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Review Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBackToHistory && (
                <Button variant="outline" size="sm" onClick={onBackToHistory}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <CardTitle className="text-2xl">Quiz Review</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span>{quiz.title}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(attempt.completedAt)}
                  </span>
                </CardDescription>
              </div>
            </div>
            {performanceMetrics && (
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  {performanceMetrics.performanceIcon}
                  <span className={`text-2xl font-bold ${performanceMetrics.performanceColor}`}>
                    {performanceMetrics.score}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {performanceMetrics.correctAnswers}/{performanceMetrics.totalQuestions} correct
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-lg font-semibold">{questions.length}</div>
              <p className="text-sm text-muted-foreground">Questions</p>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-semibold">{quiz.difficulty}</div>
              <p className="text-sm text-muted-foreground">Difficulty</p>
            </div>
            {attempt.timeTaken && (
              <div className="space-y-1">
                <div className="text-lg font-semibold">{formatTime(attempt.timeTaken)}</div>
                <p className="text-sm text-muted-foreground">Time Taken</p>
              </div>
            )}
            {performanceMetrics && (
              <div className="space-y-1">
                <div className={`text-lg font-semibold capitalize ${performanceMetrics.performanceColor}`}>
                  {performanceMetrics.performance.replace('-', ' ')}
                </div>
                <p className="text-sm text-muted-foreground">Performance</p>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={attempt.score} className="h-3" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 mt-4">
            {onRetakeQuiz && (
              <Button onClick={onRetakeQuiz} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Retake Quiz
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowExplanations(!showExplanations)}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              {showExplanations ? 'Hide' : 'Show'} Explanations
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Analytics */}
      {performanceMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Difficulty Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance by Difficulty
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(performanceMetrics.difficultyBreakdown).map(([difficulty, stats]) => {
                const percentage = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
                return (
                  <div key={difficulty} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={getDifficultyColor(difficulty)}>
                        {difficulty}
                      </Badge>
                      <span className="text-sm font-medium">
                        {stats.correct}/{stats.total} ({percentage}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Question Type Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Performance by Question Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(performanceMetrics.questionTypeBreakdown).map(([type, stats]) => {
                if (stats.total === 0) return null;
                const percentage = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {getQuestionTypeDisplay(type as QuizQuestionType)}
                      </span>
                      <span className="text-sm font-medium">
                        {stats.correct}/{stats.total} ({percentage}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Question Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {questions.map((question, index) => {
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <Button
                  key={question.id}
                  variant={isCurrent ? "default" : question.isCorrect ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleQuestionJump(index)}
                  className={`w-10 h-10 p-0 ${
                    question.isCorrect && !isCurrent 
                      ? "bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700" 
                      : !question.isCorrect && !isCurrent
                      ? "bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700"
                      : ""
                  }`}
                >
                  {index + 1}
                  {!isCurrent && (
                    question.isCorrect ? (
                      <CheckCircle className="h-3 w-3 ml-1 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-3 w-3 ml-1 text-red-600 dark:text-red-400" />
                    )
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Question Review */}
      {currentQuestion && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">
                    Question {currentQuestionIndex + 1}
                  </Badge>
                  <Badge variant="secondary">
                    {getQuestionTypeDisplay(currentQuestion.questionType)}
                  </Badge>
                  <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                    {currentQuestion.difficulty}
                  </Badge>
                  {currentQuestion.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <CardTitle className="text-xl leading-relaxed">
                  {currentQuestion.questionText}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Answer Options (for MCQ and True/False) */}
            {(currentQuestion.questionType === 'mcq' || currentQuestion.questionType === 'truefalse') && (
              <div className="space-y-3">
                {currentQuestion.questionType === 'mcq' && currentQuestion.options && (
                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => {
                      const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                      const isSelected = currentQuestion.userAnswer === option;
                      const isCorrect = option === currentQuestion.correctAnswer;
                      const isIncorrect = isSelected && option !== currentQuestion.correctAnswer;
                      
                      return (
                        <div
                          key={index}
                          className={`w-full p-4 text-left border rounded-lg ${
                            isCorrect
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : isIncorrect
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : isSelected
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-border"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                              isCorrect
                                ? "border-green-500 bg-green-500 text-white"
                                : isIncorrect
                                ? "border-red-500 bg-red-500 text-white"
                                : isSelected
                                ? "border-blue-500 bg-blue-500 text-white"
                                : "border-muted-foreground"
                            }`}>
                              {isCorrect ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : isIncorrect ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                optionLabel
                              )}
                            </div>
                            <span className="flex-1">{option}</span>
                            {isSelected && (
                              <Badge variant="outline" className="text-xs">
                                Your Answer
                              </Badge>
                            )}
                            {isCorrect && (
                              <Badge variant="outline" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                Correct
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.questionType === 'truefalse' && (
                  <div className="space-y-2">
                    {['True', 'False'].map((option) => {
                      const isSelected = currentQuestion.userAnswer === option;
                      const isCorrect = option === currentQuestion.correctAnswer;
                      const isIncorrect = isSelected && option !== currentQuestion.correctAnswer;
                      
                      return (
                        <div
                          key={option}
                          className={`w-full p-4 text-left border rounded-lg ${
                            isCorrect
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : isIncorrect
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : isSelected
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-border"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                              isCorrect
                                ? "border-green-500 bg-green-500 text-white"
                                : isIncorrect
                                ? "border-red-500 bg-red-500 text-white"
                                : isSelected
                                ? "border-blue-500 bg-blue-500 text-white"
                                : "border-muted-foreground"
                            }`}>
                              {isCorrect ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : isIncorrect ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                option[0]
                              )}
                            </div>
                            <span className="flex-1">{option}</span>
                            {isSelected && (
                              <Badge variant="outline" className="text-xs">
                                Your Answer
                              </Badge>
                            )}
                            {isCorrect && (
                              <Badge variant="outline" className="text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                                Correct
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Fill in the Blank Answer */}
            {currentQuestion.questionType === 'fillblank' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-3 rounded-lg border ${
                    currentQuestion.isCorrect 
                      ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  }`}>
                    <h4 className={`font-medium mb-2 ${
                      currentQuestion.isCorrect 
                        ? "text-green-800 dark:text-green-200"
                        : "text-red-800 dark:text-red-200"
                    }`}>
                      Your Answer
                    </h4>
                    <p className={`${
                      currentQuestion.isCorrect 
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                    }`}>
                      {currentQuestion.userAnswer || "No answer provided"}
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                      Correct Answer
                    </h4>
                    <p className="text-blue-700 dark:text-blue-300">
                      {currentQuestion.correctAnswer}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Explanation */}
            {showExplanations && currentQuestion.explanation && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Explanation
                </h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                  {currentQuestion.explanation}
                </p>
                
                {/* Source Information */}
                {currentQuestion.sourcePages && currentQuestion.sourcePages.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Source: Pages {currentQuestion.sourcePages.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === questions.length - 1}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}