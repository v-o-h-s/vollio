"use client";

import React, { createContext, useContext, useCallback } from "react";
import { useAccessibilityMode } from "@/hooks/use-accessibility-mode";
import type { AccessibilityMode } from "@/hooks/use-accessibility-mode";

interface QuizAccessibilityContextValue {
  settings: ReturnType<typeof useAccessibilityMode>['settings'];
  isInitialized: boolean;
  updateSetting: ReturnType<typeof useAccessibilityMode>['updateSetting'];
  toggleAccessibilityMode: ReturnType<typeof useAccessibilityMode>['toggleAccessibilityMode'];
  resetSettings: ReturnType<typeof useAccessibilityMode>['resetSettings'];
  announce: ReturnType<typeof useAccessibilityMode>['announce'];
  announceQuestionChange: (questionNumber: number, totalQuestions: number) => void;
  announceAnswerSelection: (answer: string, isCorrect?: boolean) => void;
  announceScoreUpdate: (score: number, totalQuestions: number) => void;
  announceNavigationChange: (action: string) => void;
}

const QuizAccessibilityContext = createContext<QuizAccessibilityContextValue | undefined>(undefined);

interface QuizAccessibilityProviderProps {
  children: React.ReactNode;
}

export function QuizAccessibilityProvider({ children }: QuizAccessibilityProviderProps) {
  const accessibilityHook = useAccessibilityMode();
  const { announce } = accessibilityHook;

  // Quiz-specific announcement functions
  const announceQuestionChange = useCallback((questionNumber: number, totalQuestions: number) => {
    announce(
      `Question ${questionNumber} of ${totalQuestions}`,
      'polite'
    );
  }, [announce]);

  const announceAnswerSelection = useCallback((answer: string, isCorrect?: boolean) => {
    let message = `Selected answer: ${answer}`;
    if (isCorrect !== undefined) {
      message += isCorrect ? '. Correct!' : '. Incorrect.';
    }
    announce(message, 'polite');
  }, [announce]);

  const announceScoreUpdate = useCallback((score: number, totalQuestions: number) => {
    announce(
      `Quiz completed. Your score: ${score} out of ${totalQuestions} correct answers.`,
      'assertive'
    );
  }, [announce]);

  const announceNavigationChange = useCallback((action: string) => {
    announce(action, 'polite');
  }, [announce]);

  const contextValue: QuizAccessibilityContextValue = {
    ...accessibilityHook,
    announceQuestionChange,
    announceAnswerSelection,
    announceScoreUpdate,
    announceNavigationChange,
  };

  return (
    <QuizAccessibilityContext.Provider value={contextValue}>
      {children}
    </QuizAccessibilityContext.Provider>
  );
}

export function useQuizAccessibility() {
  const context = useContext(QuizAccessibilityContext);
  if (context === undefined) {
    throw new Error('useQuizAccessibility must be used within a QuizAccessibilityProvider');
  }
  return context;
}