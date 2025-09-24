"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToastActions } from "@/components/ui/toast";
import { QuizResultsErrorBoundary } from "./QuizErrorBoundary";
import { QuizResultsSkeleton } from "./QuizLoadingStates";
import { useQuizResultsErrorHandling } from "@/hooks/use-quiz-error-handling";
import { 
  Award, 
  Clock, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle, 
  BookOpen,
  BarChart3,
  RefreshCw,
  Share2,
  Download,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Trophy,
  Star,
  AlertCircle
} from "lucide-react";
import { QuizResults, QuestionResult } from "@/lib/services/quiz-scoring-service";
import { Quiz, QuizQuestionType } from "@/lib/types";

interface QuizResultsDisplayProps {
  quiz: Quiz;
  results: QuizResults;
  onRetakeQuiz?: () => void;
  onViewQuiz?: () => void;
  onShareResults?: () => void;
  onExportResults?: () => void;
  className?: string;
}

interface ResultsFilter {
  showCorrect: boolean;
  showIncorrect: boolean;
  showExplanations: boolean;
  questionType?: QuizQuestionType;
  difficulty?: string;
}

export function QuizResultsDisplay({
  quiz,
  results,
  onRetakeQuiz,
  onViewQuiz,
  onShareResults,
  onExportResults,
  className
}: QuizResultsDisplayProps) {
  const toast = useToastActions();
  const { handleError, executeWithErrorHandling } = useQuizResultsErrorHandling();

  const [filter, setFilter] = useState<ResultsFilter>({
    showCorrect: true,
    showIncorrect: true,
    showExplanations: true,
  });
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Calculate performance metrics
  const performanceMetrics = useMemo(() => {
    const { totalScore, correctAnswers, totalQuestions, timeTaken } = results;
    
    let performance: 'excellent' | 'good' | 'fair' | 'needs-improvement';
    let performanceColor: string;
    let performanceIcon: React.ReactNode;

    if (totalScore >= 90) {
      performance = 'excellent';
      performanceColor = 'text-green-600 dark:text-green-400';
      performanceIcon = <Trophy className="h-5 w-5 text-yellow-500" />;
    } else if (totalScore >= 75) {
      performance = 'good';
      performanceColor = 'text-blue-600 dark:text-blue-400';
      performanceIcon = <Star className="h-5 w-5 text-blue-500" />;
    } else if (totalScore >= 60) {
      performance = 'fair';
      performanceColor = 'text-yellow-600 dark:text-yellow-400';
      performanceIcon = <Target className="h-5 w-5 text-yellow-500" />;
    } else {
      performance = 'needs-improvement';
      performanceColor = 'text-red-600 dark:text-red-400';
      performanceIcon = <AlertCircle className="h-5 w-5 text-red-500" />;
    }

    return {
      performance,
      performanceColor,
      performanceIcon,
      accuracy: Math.round((correctAnswers / totalQuestions) * 100),
      averageTimePerQuestion: timeTaken ? Math.round(timeTaken / totalQuestions) : null,
    };
  }, [results]);

  // Filter questions based on current filter settings
  const filteredQuestions = useMemo(() => {
    return results.questionResults.filter(result => {
      if (!filter.showCorrect && result.isCorrect) return false;
      if (!filter.showIncorrect && !result.isCorrect) return false;
      if (filter.questionType && result.questionType !== filter.questionType) return false;
      if (filter.difficulty && result.difficulty !== filter.difficulty) return false;
      return true;
    });
  }, [results.questionResults, filter]);

  // Toggle question expansion
  const toggleQuestionExpansion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  // Enhanced action handlers with error handling
  const handleRetakeQuiz = async () => {
    if (!onRetakeQuiz) return;
    
    try {
      await executeWithErrorHandling(async () => {
        await onRetakeQuiz();
        toast.success("Starting New Attempt", "Good luck with your retake!");
      });
    } catch (error) {
      handleError(error);
    }
  };

  const handleShareResults = async () => {
    if (!onShareResults) return;
    
    setIsSharing(true);
    try {
      await executeWithErrorHandling(async () => {
        await onShareResults();
        toast.success("Results Shared", "Your quiz results have been shared successfully.");
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleExportResults = async () => {
    if (!onExportResults) return;
    
    setIsExporting(true);
    try {
      await executeWithErrorHandling(async () => {
        await onExportResults();
        toast.success("Results Exported", "Your quiz results have been exported successfully.");
      });
    } catch (error) {
      handleError(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyResults = async () => {
    try {
      const resultsText = `Quiz Results: ${quiz.title}
Score: ${results.totalScore}% (${results.correctAnswers}/${results.totalQuestions})
Time: ${results.timeTaken ? Math.floor(results.timeTaken / 60) : 0}m ${results.timeTaken ? results.timeTaken % 60 : 0}s
Completed: ${new Date(results.completedAt).toLocaleDateString()}`;

      await navigator.clipboard.writeText(resultsText);
      toast.success("Results Copied", "Quiz results copied to clipboard.");
    } catch (error) {
      toast.error("Copy Failed", "Unable to copy results to clipboard.");
    }
  };

  return (
    <QuizResultsErrorBoundary>
      <div className={`max-w-6xl mx-auto space-y-6 ${className}`}>
      {/* Results Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            {performanceMetrics.performanceIcon}
            <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {quiz.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            {/* Score */}
            <div className="space-y-2">
              <div className={`text-4xl font-bold ${performanceMetrics.performanceColor}`}>
                {results.totalScore}%
              </div>
              <p className="text-sm text-muted-foreground">Final Score</p>
            </div>

            {/* Accuracy */}
            <div className="space-y-2">
              <div className="text-2xl font-semibold flex items-center justify-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                {results.correctAnswers}/{results.totalQuestions}
              </div>
              <p className="text-sm text-muted-foreground">Correct Answers</p>
            </div>

            {/* Time */}
            {results.timeTaken && (
              <div className="space-y-2">
                <div className="text-2xl font-semibold flex items-center justify-center gap-2">
                  <Clock className="h-6 w-6 text-blue-500" />
                  {formatTime(results.timeTaken)}
                </div>
                <p className="text-sm text-muted-foreground">Time Taken</p>
              </div>
            )}

            {/* Performance */}
            <div className="space-y-2">
              <div className={`text-lg font-medium capitalize ${performanceMetrics.performanceColor}`}>
                {performanceMetrics.performance.replace('-', ' ')}
              </div>
              <p className="text-sm text-muted-foreground">Performance</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <Progress value={results.totalScore} className="h-3" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            {onRetakeQuiz && (
              <Button onClick={handleRetakeQuiz} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Retake Quiz
              </Button>
            )}
            {onViewQuiz && (
              <Button variant="outline" onClick={onViewQuiz} className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Review Quiz
              </Button>
            )}
            {onShareResults && (
              <Button 
                variant="outline" 
                onClick={handleShareResults}
                disabled={isSharing}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                {isSharing ? "Sharing..." : "Share Results"}
              </Button>
            )}
            {onExportResults && (
              <Button 
                variant="outline" 
                onClick={handleExportResults}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export Results"}
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleCopyResults}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Copy Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Dashboard */}
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
            {Object.entries(results.analytics.difficultyBreakdown).map(([difficulty, stats]) => {
              const percentage = Math.round((stats.correct / stats.total) * 100);
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
            {Object.entries(results.analytics.questionTypeBreakdown).map(([type, stats]) => {
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

      {/* Strengths and Weaknesses */}
      {(results.analytics.strongAreas.length > 0 || results.analytics.weakAreas.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strong Areas */}
          {results.analytics.strongAreas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <TrendingUp className="h-5 w-5" />
                  Strong Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {results.analytics.strongAreas.map((area, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weak Areas */}
          {results.analytics.weakAreas.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <TrendingDown className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {results.analytics.weakAreas.map((area, index) => (
                    <Badge key={index} variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Question Results Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
          <CardDescription>
            Review your answers and explanations for each question
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant={filter.showCorrect ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(prev => ({ ...prev, showCorrect: !prev.showCorrect }))}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Correct ({results.correctAnswers})
              </Button>
              <Button
                variant={filter.showIncorrect ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(prev => ({ ...prev, showIncorrect: !prev.showIncorrect }))}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Incorrect ({results.totalQuestions - results.correctAnswers})
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button
              variant={filter.showExplanations ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(prev => ({ ...prev, showExplanations: !prev.showExplanations }))}
              className="flex items-center gap-2"
            >
              {filter.showExplanations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              Explanations
            </Button>
          </div>

          <div className="text-sm text-muted-foreground mb-4">
            Showing {filteredQuestions.length} of {results.questionResults.length} questions
          </div>
        </CardContent>
      </Card>

      {/* Question Results */}
      <div className="space-y-4">
        {filteredQuestions.map((result, index) => {
          const isExpanded = expandedQuestions.has(result.questionId);
          
          return (
            <Card key={result.questionId} className={`transition-colors ${
              result.isCorrect 
                ? "border-green-200 dark:border-green-800" 
                : "border-red-200 dark:border-red-800"
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">Question {index + 1}</Badge>
                      <Badge className={getDifficultyColor(result.difficulty)}>
                        {result.difficulty}
                      </Badge>
                      <Badge variant="secondary">
                        {getQuestionTypeDisplay(result.questionType)}
                      </Badge>
                      {result.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <CardTitle className="text-lg leading-relaxed">
                      {result.questionText}
                    </CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleQuestionExpansion(result.questionId)}
                    className="ml-4"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 space-y-4">
                  {/* Answer Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-3 rounded-lg border ${
                      result.isCorrect 
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        result.isCorrect 
                          ? "text-green-800 dark:text-green-200"
                          : "text-red-800 dark:text-red-200"
                      }`}>
                        Your Answer
                      </h4>
                      <p className={`${
                        result.isCorrect 
                          ? "text-green-700 dark:text-green-300"
                          : "text-red-700 dark:text-red-300"
                      }`}>
                        {result.userAnswer || "No answer provided"}
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                        Correct Answer
                      </h4>
                      <p className="text-blue-700 dark:text-blue-300">
                        {result.correctAnswer}
                      </p>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium">
                      Points: {result.points.toFixed(1)}/{result.maxPoints}
                    </span>
                    {result.sourcePages && result.sourcePages.length > 0 && (
                      <span className="text-muted-foreground">
                        Source: Pages {result.sourcePages.join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Explanation */}
                  {filter.showExplanations && result.explanation && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Explanation
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                        {result.explanation}
                      </p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {filteredQuestions.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              No questions match the current filter criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </QuizResultsErrorBoundary>
  );
}