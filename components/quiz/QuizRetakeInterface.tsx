"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorNotification } from "@/components/ui/error-notification";
import { 
  RefreshCw, 
  BookOpen, 
  Target, 
  Clock, 
  ArrowRight,
  Settings,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";
import { Quiz, QuizDifficulty, QuizQuestionType } from "@/lib/types";
import { useGetQuizDetailsQuery, useGenerateQuizMutation } from "@/lib/store/apiSlice";

interface QuizRetakeInterfaceProps {
  originalQuiz: Quiz;
  onQuizGenerated?: (newQuizId: string) => void;
  onCancel?: () => void;
  className?: string;
}

interface RetakeOptions {
  questionCount: number;
  difficulty: QuizDifficulty;
  questionTypes: QuizQuestionType[];
  generateNewQuestions: boolean;
  focusOnWeakAreas: boolean;
}

export function QuizRetakeInterface({
  originalQuiz,
  onQuizGenerated,
  onCancel,
  className
}: QuizRetakeInterfaceProps) {
  const [retakeOptions, setRetakeOptions] = useState<RetakeOptions>({
    questionCount: originalQuiz.questionCount,
    difficulty: originalQuiz.difficulty,
    questionTypes: originalQuiz.questionTypes,
    generateNewQuestions: true,
    focusOnWeakAreas: false,
  });
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Fetch original quiz details to analyze performance
  const {
    data: quizDetails,
    isLoading: isLoadingDetails,
    error: detailsError
  } = useGetQuizDetailsQuery(originalQuiz.id);

  // Generate new quiz mutation
  const [generateQuiz, { 
    isLoading: isGenerating, 
    error: generateError 
  }] = useGenerateQuizMutation();

  // Analyze previous performance to suggest improvements
  const performanceAnalysis = React.useMemo(() => {
    if (!quizDetails?.data?.attempts || quizDetails.data.attempts.length === 0) {
      return null;
    }

    const attempts = quizDetails.data.attempts;
    const latestAttempt = attempts[0]; // Most recent attempt
    const averageScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length;
    const bestScore = Math.max(...attempts.map(a => a.score));
    const improvementPotential = 100 - bestScore;

    // Determine suggested difficulty based on performance
    let suggestedDifficulty: QuizDifficulty = originalQuiz.difficulty;
    if (averageScore >= 90 && originalQuiz.difficulty !== 'hard') {
      suggestedDifficulty = originalQuiz.difficulty === 'easy' ? 'medium' : 'hard';
    } else if (averageScore < 60 && originalQuiz.difficulty !== 'easy') {
      suggestedDifficulty = originalQuiz.difficulty === 'hard' ? 'medium' : 'easy';
    }

    return {
      latestScore: latestAttempt.score,
      averageScore: Math.round(averageScore),
      bestScore,
      totalAttempts: attempts.length,
      improvementPotential,
      suggestedDifficulty,
      shouldIncreaseDifficulty: averageScore >= 85,
      shouldDecreaseDifficulty: averageScore < 65,
    };
  }, [quizDetails, originalQuiz.difficulty]);

  // Handle quiz generation
  const handleGenerateQuiz = async () => {
    try {
      const result = await generateQuiz({
        documentIds: originalQuiz.sourceDocumentIds,
        pageRange: originalQuiz.pageRange,
        questionCount: retakeOptions.questionCount,
        difficulty: retakeOptions.difficulty,
        questionTypes: retakeOptions.questionTypes,
        notes: originalQuiz.notes,
        focusAreas: retakeOptions.focusOnWeakAreas 
          ? [...(originalQuiz.focusAreas || []), 'review weak areas from previous attempts']
          : originalQuiz.focusAreas,
        learningObjectives: originalQuiz.learningObjectives,
      }).unwrap();

      if (result.success && result.data) {
        onQuizGenerated?.(result.data.quizId);
      }
    } catch (error) {
      console.error('Failed to generate retake quiz:', error);
    }
  };

  // Apply performance-based suggestions
  const applySuggestions = () => {
    if (!performanceAnalysis) return;

    setRetakeOptions(prev => ({
      ...prev,
      difficulty: performanceAnalysis.suggestedDifficulty,
      focusOnWeakAreas: performanceAnalysis.averageScore < 80,
      questionCount: performanceAnalysis.shouldIncreaseDifficulty 
        ? Math.min(prev.questionCount + 5, 50)
        : prev.questionCount,
    }));
  };

  if (isLoadingDetails) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-muted-foreground">Analyzing previous performance...</span>
      </div>
    );
  }

  if (detailsError) {
    return (
      <ErrorNotification
        title="Failed to Load Quiz Details"
        message="Unable to analyze your previous performance. You can still retake the quiz with default settings."
      />
    );
  }

  return (
    <div className={`max-w-2xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <RefreshCw className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">Retake Quiz</CardTitle>
          </div>
          <CardDescription className="text-lg">
            {originalQuiz.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-lg font-semibold">{originalQuiz.questionCount}</div>
              <p className="text-sm text-muted-foreground">Original Questions</p>
            </div>
            <div className="space-y-1">
              <Badge className="text-sm px-3 py-1">
                {originalQuiz.difficulty}
              </Badge>
              <p className="text-sm text-muted-foreground">Original Difficulty</p>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-semibold">{originalQuiz.sourceDocumentIds.length}</div>
              <p className="text-sm text-muted-foreground">Source Documents</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Analysis */}
      {performanceAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Analysis
            </CardTitle>
            <CardDescription>
              Based on your {performanceAnalysis.totalAttempts} previous attempt{performanceAnalysis.totalAttempts > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {performanceAnalysis.latestScore}%
                </div>
                <p className="text-sm text-muted-foreground">Latest Score</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {performanceAnalysis.bestScore}%
                </div>
                <p className="text-sm text-muted-foreground">Best Score</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {performanceAnalysis.averageScore}%
                </div>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
            </div>

            {/* Suggestions */}
            <div className="space-y-3">
              {performanceAnalysis.shouldIncreaseDifficulty && (
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Ready for a Challenge?
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Your strong performance suggests you might benefit from {performanceAnalysis.suggestedDifficulty} difficulty.
                    </p>
                  </div>
                </div>
              )}

              {performanceAnalysis.shouldDecreaseDifficulty && (
                <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-100">
                      Consider Easier Questions
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Try {performanceAnalysis.suggestedDifficulty} difficulty to build confidence before advancing.
                    </p>
                  </div>
                </div>
              )}

              {performanceAnalysis.improvementPotential > 20 && (
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <Target className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-100">
                      Room for Improvement
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Focus on weak areas to improve your score by up to {performanceAnalysis.improvementPotential}%.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {(performanceAnalysis.shouldIncreaseDifficulty || performanceAnalysis.shouldDecreaseDifficulty || performanceAnalysis.improvementPotential > 20) && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={applySuggestions}
                  className="w-full flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Apply Suggestions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Retake Options */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Retake Options</CardTitle>
              <CardDescription>
                Customize your retake experience
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {showAdvancedOptions ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Number of Questions</label>
              <select
                value={retakeOptions.questionCount}
                onChange={(e) => setRetakeOptions(prev => ({ 
                  ...prev, 
                  questionCount: parseInt(e.target.value) 
                }))}
                className="w-full p-2 border rounded-md bg-background"
              >
                {[5, 10, 15, 20, 25, 30, 40, 50].map(count => (
                  <option key={count} value={count}>{count} questions</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
              <select
                value={retakeOptions.difficulty}
                onChange={(e) => setRetakeOptions(prev => ({ 
                  ...prev, 
                  difficulty: e.target.value as QuizDifficulty 
                }))}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Question Types */}
          <div>
            <label className="text-sm font-medium mb-2 block">Question Types</label>
            <div className="flex flex-wrap gap-2">
              {(['mcq', 'truefalse', 'fillblank'] as QuizQuestionType[]).map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={retakeOptions.questionTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setRetakeOptions(prev => ({
                          ...prev,
                          questionTypes: [...prev.questionTypes, type]
                        }));
                      } else {
                        setRetakeOptions(prev => ({
                          ...prev,
                          questionTypes: prev.questionTypes.filter(t => t !== type)
                        }));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">
                    {type === 'mcq' ? 'Multiple Choice' : 
                     type === 'truefalse' ? 'True/False' : 
                     'Fill in the Blank'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          {showAdvancedOptions && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={retakeOptions.generateNewQuestions}
                    onChange={(e) => setRetakeOptions(prev => ({
                      ...prev,
                      generateNewQuestions: e.target.checked
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Generate New Questions</span>
                </label>
                <p className="text-xs text-muted-foreground ml-6">
                  Create entirely new questions from the same source material to avoid memorization.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={retakeOptions.focusOnWeakAreas}
                    onChange={(e) => setRetakeOptions(prev => ({
                      ...prev,
                      focusOnWeakAreas: e.target.checked
                    }))}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Focus on Weak Areas</span>
                </label>
                <p className="text-xs text-muted-foreground ml-6">
                  Emphasize topics where you scored lower in previous attempts.
                </p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {retakeOptions.generateNewQuestions 
                  ? "New questions will be generated from the same source documents to provide a fresh challenge."
                  : "The same questions from your original quiz will be used, but in a different order."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {generateError && (
        <ErrorNotification
          title="Failed to Generate Quiz"
          message="Unable to generate your retake quiz. Please try again."
        />
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            
            <div className="flex items-center gap-3">
              <div className="text-right text-sm text-muted-foreground">
                <p>Ready to improve your score?</p>
                <p className="font-medium">
                  {retakeOptions.questionCount} {retakeOptions.difficulty} questions
                </p>
              </div>
              <Button
                onClick={handleGenerateQuiz}
                disabled={isGenerating || retakeOptions.questionTypes.length === 0}
                className="flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Start Retake
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}