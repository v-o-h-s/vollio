"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  Trophy,
  RotateCcw
} from "lucide-react";
import { QuizResults, QuestionResult } from "@/lib/services/quiz-scoring-service";
import { Quiz, QuizQuestionType } from "@/lib/types";

interface QuizResultsDisplayProps {
  results: QuizResults;
  quiz: Quiz;
  onRetakeQuiz?: () => void;
  onViewReview?: () => void;
}

export function QuizResultsDisplay({ 
  results, 
  quiz, 
  onRetakeQuiz, 
  onViewReview 
}: QuizResultsDisplayProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
    if (score >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
    return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
  };

  return (
    <div className="space-y-6">
      {/* Overall Results */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full ${results.totalScore >= 80 ? 'bg-green-100 dark:bg-green-900/20' : 
                                                results.totalScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/20' : 
                                                'bg-red-100 dark:bg-red-900/20'}`}>
              <Trophy className={`h-8 w-8 ${getScoreColor(results.totalScore)}`} />
            </div>
          </div>
          <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
          <div className="space-y-2">
            <div className={`text-4xl font-bold ${getScoreColor(results.totalScore)}`}>
              {results.totalScore}%
            </div>
            <Badge className={getScoreBadgeColor(results.totalScore)}>
              {results.correctAnswers} of {results.totalQuestions} correct
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-muted-foreground">
                {results.totalPoints}
              </div>
              <div className="text-sm text-muted-foreground">Points Earned</div>
            </div>
            {results.timeTaken && (
              <div>
                <div className="text-2xl font-bold text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="h-5 w-5" />
                  {Math.floor(results.timeTaken / 60)}:{(results.timeTaken % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-center pt-4">
            {onRetakeQuiz && (
              <Button onClick={onRetakeQuiz} variant="outline" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Retake Quiz
              </Button>
            )}
            {onViewReview && (
              <Button onClick={onViewReview} className="flex items-center gap-2">
                View Review
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Results */}
      <Card>
        <CardHeader>
          <CardTitle>Question Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.questionResults.map((result, index) => (
            <div key={result.questionId} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Question {index + 1}</span>
                    <Badge variant="outline" className="text-xs">
                      {result.difficulty}
                    </Badge>
                    {result.isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {result.questionText}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {result.points.toFixed(1)} / {result.maxPoints} pts
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Your Answer: </span>
                  <span className={result.isCorrect ? "text-green-600" : "text-red-600"}>
                    {result.userAnswer || "No answer"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Correct Answer: </span>
                  <span className="text-green-600">{result.correctAnswer}</span>
                </div>
              </div>

              {result.explanation && (
                <div className="bg-muted/50 rounded p-3">
                  <p className="text-sm">{result.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}