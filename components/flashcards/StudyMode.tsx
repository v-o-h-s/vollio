"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Trophy,
  Target,
} from "lucide-react";

interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  hint?: string;
}

interface StudyModeProps {
  flashcards: FlashcardItem[];
  onComplete: (results: StudyResult[]) => void;
  onExit: () => void;
}

interface StudyResult {
  cardId: string;
  correct: boolean;
  timeSpent: number;
}

export function StudyMode({ flashcards, onComplete, onExit }: StudyModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [results, setResults] = useState<StudyResult[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [sessionStartTime] = useState<number>(Date.now());
  const [showHint, setShowHint] = useState(false);

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;
  const correctAnswers = results.filter(r => r.correct).length;
  const totalAnswered = results.length;

  // Reset card state when moving to next card
  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
    setStartTime(Date.now());
  }, [currentIndex]);

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleAnswer = (correct: boolean) => {
    const timeSpent = Date.now() - startTime;
    const newResult: StudyResult = {
      cardId: currentCard.id,
      correct,
      timeSpent,
    };

    const newResults = [...results, newResult];
    setResults(newResults);

    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Study session complete
      onComplete(newResults);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Remove the last result if going back
      setResults(results.slice(0, -1));
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const sessionTime = Date.now() - sessionStartTime;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onExit} className="hover:scale-105 transition-transform duration-200">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Exit Study
          </Button>
          <div className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {flashcards.length}
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {formatTime(sessionTime)}
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            {correctAnswers}/{totalAnswered}
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            {totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0}%
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div className="flex justify-center">
        <div
          className={`relative w-full max-w-2xl h-80 cursor-pointer transition-all duration-500 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={!isFlipped ? handleFlip : undefined}
        >
          {/* Front Side */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <Card className="w-full h-full bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-950/50 dark:to-rose-900/50 border-pink-200 dark:border-pink-800 hover:shadow-xl transition-shadow duration-300">
              <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="space-y-4">
                  <div className="text-xs uppercase tracking-wide text-pink-600 dark:text-pink-400 font-medium">
                    Question
                  </div>
                  <p className="text-xl font-medium text-foreground leading-relaxed">
                    {currentCard.front}
                  </p>
                  
                  {currentCard.hint && (
                    <div className="mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowHint(!showHint);
                        }}
                        className="hover:scale-105 transition-transform duration-200"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {showHint ? "Hide Hint" : "Show Hint"}
                      </Button>
                      
                      {showHint && (
                        <div className="mt-3 p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                          <p className="text-sm text-pink-700 dark:text-pink-300 italic">
                            💡 {currentCard.hint}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-6 text-sm text-muted-foreground">
                    Click to reveal answer
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
            <Card className="w-full h-full bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950/50 dark:to-cyan-900/50 border-blue-200 dark:border-blue-800 hover:shadow-xl transition-shadow duration-300">
              <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="space-y-4">
                  <div className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 font-medium">
                    Answer
                  </div>
                  <p className="text-xl font-medium text-foreground leading-relaxed">
                    {currentCard.back}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {!isFlipped ? (
          <Button
            onClick={handleFlip}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 px-8 py-3 text-lg hover:scale-105 transition-all duration-200"
          >
            <Eye className="w-5 h-5 mr-2" />
            Reveal Answer
          </Button>
        ) : (
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="hover:scale-105 transition-transform duration-200"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-3">
              <Button
                onClick={() => handleAnswer(false)}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20 hover:scale-105 transition-all duration-200"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Incorrect
              </Button>
              
              <Button
                onClick={() => handleAnswer(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:scale-105 transition-all duration-200"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Correct
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              className="hover:scale-105 transition-transform duration-200"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-foreground">{currentIndex + 1}</div>
          <div className="text-xs text-muted-foreground">Current</div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{correctAnswers}</div>
          <div className="text-xs text-muted-foreground">Correct</div>
        </Card>
        <Card className="text-center p-3">
          <div className="text-2xl font-bold text-foreground">{flashcards.length - currentIndex - 1}</div>
          <div className="text-xs text-muted-foreground">Remaining</div>
        </Card>
      </div>
    </div>
  );
}