"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Clock,
  Target,
  TrendingUp,
  RotateCcw,
  Home,
  CheckCircle,
  XCircle,
  Star,
  Zap,
} from "lucide-react";

interface StudyResult {
  cardId: string;
  correct: boolean;
  timeSpent: number;
}

interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

interface StudyResultsProps {
  results: StudyResult[];
  flashcards: FlashcardItem[];
  totalTime: number;
  onStudyAgain: () => void;
  onGoHome: () => void;
}

export function StudyResults({
  results,
  flashcards,
  totalTime,
  onStudyAgain,
  onGoHome,
}: StudyResultsProps) {
  const correctCount = results.filter(r => r.correct).length;
  const incorrectCount = results.length - correctCount;
  const accuracy = Math.round((correctCount / results.length) * 100);
  const averageTime = Math.round(totalTime / results.length / 1000);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getPerformanceLevel = (accuracy: number) => {
    if (accuracy >= 90) return { level: "Excellent", color: "text-green-600 dark:text-green-400", icon: Star };
    if (accuracy >= 80) return { level: "Great", color: "text-blue-600 dark:text-blue-400", icon: Trophy };
    if (accuracy >= 70) return { level: "Good", color: "text-yellow-600 dark:text-yellow-400", icon: Target };
    return { level: "Keep Practicing", color: "text-orange-600 dark:text-orange-400", icon: TrendingUp };
  };

  const performance = getPerformanceLevel(accuracy);
  const PerformanceIcon = performance.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full">
            <Trophy className="w-12 h-12 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Study Session Complete!</h1>
        <p className="text-muted-foreground text-lg">
          Great job! Here's how you performed on this flashcard deck.
        </p>
      </div>

      {/* Performance Overview */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PerformanceIcon className="w-6 h-6" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Accuracy */}
            <div className="text-center space-y-2">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/50 dark:to-emerald-900/50 rounded-xl">
                <Target className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {accuracy}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>

            {/* Total Time */}
            <div className="text-center space-y-2">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950/50 dark:to-cyan-900/50 rounded-xl">
                <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatTime(totalTime)}
                </div>
                <div className="text-sm text-muted-foreground">Total Time</div>
              </div>
            </div>

            {/* Correct Answers */}
            <div className="text-center space-y-2">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/50 dark:to-violet-900/50 rounded-xl">
                <CheckCircle className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {correctCount}/{results.length}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
            </div>

            {/* Average Time */}
            <div className="text-center space-y-2">
              <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/50 dark:to-amber-900/50 rounded-xl">
                <Zap className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {averageTime}s
                </div>
                <div className="text-sm text-muted-foreground">Avg/Card</div>
              </div>
            </div>
          </div>

          {/* Performance Badge */}
          <div className="flex justify-center mt-6">
            <Badge className={`px-4 py-2 text-lg ${performance.color} bg-transparent border-2`}>
              <PerformanceIcon className="w-5 h-5 mr-2" />
              {performance.level}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle>Card-by-Card Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {results.map((result, index) => {
              const card = flashcards.find(c => c.id === result.cardId);
              if (!card) return null;

              return (
                <div
                  key={result.cardId}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.correct
                      ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                      : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.correct ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                    <div>
                      <p className="font-medium text-sm">{card.front}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(result.timeSpent / 1000)}s
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={result.correct ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {result.correct ? "Correct" : "Incorrect"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={onGoHome}
          className="hover:scale-105 transition-transform duration-200"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Flashcards
        </Button>
        
        <Button
          onClick={onStudyAgain}
          className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 hover:scale-105 transition-all duration-200"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Study Again
        </Button>
      </div>

      {/* Motivational Message */}
      <div className="text-center space-y-2">
        {accuracy >= 90 && (
          <p className="text-green-600 dark:text-green-400 font-medium">
            🎉 Outstanding performance! You've mastered this deck!
          </p>
        )}
        {accuracy >= 80 && accuracy < 90 && (
          <p className="text-blue-600 dark:text-blue-400 font-medium">
            🌟 Great job! You're well on your way to mastering this material.
          </p>
        )}
        {accuracy >= 70 && accuracy < 80 && (
          <p className="text-yellow-600 dark:text-yellow-400 font-medium">
            👍 Good work! A few more practice sessions and you'll have it down.
          </p>
        )}
        {accuracy < 70 && (
          <p className="text-orange-600 dark:text-orange-400 font-medium">
            💪 Keep practicing! Every study session brings you closer to mastery.
          </p>
        )}
      </div>
    </div>
  );
}