"use client";

import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { InteractiveQuizPlayer } from "./InteractiveQuizPlayer";
import { MobileQuizPlayer } from "./MobileQuizPlayer";
import { Quiz, QuizQuestion } from "@/lib/types";
import { QuizResults } from "@/lib/services/quiz-scoring-service";

interface ResponsiveQuizPlayerProps {
  quiz: Quiz;
  questions: QuizQuestion[];
  onComplete: (results: QuizResults) => void;
  onExit?: () => void;
  className?: string;
}

/**
 * Responsive wrapper that automatically switches between desktop and mobile quiz players
 * Uses device detection to provide optimal experience for each screen size
 */
export function ResponsiveQuizPlayer({ 
  quiz, 
  questions, 
  onComplete, 
  onExit, 
  className 
}: ResponsiveQuizPlayerProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileQuizPlayer
        quiz={quiz}
        questions={questions}
        onComplete={onComplete}
        onExit={onExit}
        className={className}
      />
    );
  }

  return (
    <InteractiveQuizPlayer
      quiz={quiz}
      questions={questions}
      onComplete={onComplete}
      onExit={onExit}
      className={className}
    />
  );
}