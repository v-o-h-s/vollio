import { useCallback } from "react";
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts";

interface QuizKeyboardShortcutsOptions {
  onNextQuestion?: () => void;
  onPreviousQuestion?: () => void;
  onSubmitQuiz?: () => void;
  onSelectAnswer?: (index: number) => void;
  onToggleExplanations?: () => void;
  onJumpToQuestion?: (index: number) => void;
  onExitQuiz?: () => void;
  onShowHelp?: () => void;
  enabled?: boolean;
  currentQuestionIndex?: number;
  totalQuestions?: number;
  canSubmit?: boolean;
  isCompleted?: boolean;
}

export interface QuizKeyboardShortcut {
  key: string;
  description: string;
  category: 'navigation' | 'answers' | 'actions' | 'help';
}

export const QUIZ_SHORTCUTS: QuizKeyboardShortcut[] = [
  // Navigation
  { key: 'ArrowRight', description: 'Next question', category: 'navigation' },
  { key: 'ArrowLeft', description: 'Previous question', category: 'navigation' },
  { key: 'Home', description: 'First question', category: 'navigation' },
  { key: 'End', description: 'Last question', category: 'navigation' },
  { key: 'Mod-g', description: 'Go to question (prompt)', category: 'navigation' },
  
  // Answer selection (for MCQ and True/False)
  { key: '1', description: 'Select first answer option', category: 'answers' },
  { key: '2', description: 'Select second answer option', category: 'answers' },
  { key: '3', description: 'Select third answer option', category: 'answers' },
  { key: '4', description: 'Select fourth answer option', category: 'answers' },
  { key: 'a', description: 'Select option A', category: 'answers' },
  { key: 'b', description: 'Select option B', category: 'answers' },
  { key: 'c', description: 'Select option C', category: 'answers' },
  { key: 'd', description: 'Select option D', category: 'answers' },
  { key: 't', description: 'Select True (True/False questions)', category: 'answers' },
  { key: 'f', description: 'Select False (True/False questions)', category: 'answers' },
  
  // Actions
  { key: 'Enter', description: 'Submit quiz (when ready)', category: 'actions' },
  { key: 'Mod-Enter', description: 'Force submit quiz', category: 'actions' },
  { key: 'Escape', description: 'Exit quiz', category: 'actions' },
  { key: 'Mod-r', description: 'Retake quiz (on results)', category: 'actions' },
  { key: 'e', description: 'Toggle explanations (on results)', category: 'actions' },
  
  // Help and accessibility
  { key: 'Mod-/', description: 'Show keyboard shortcuts', category: 'help' },
  { key: 'Alt-h', description: 'Show help', category: 'help' },
  { key: 'Mod-Shift-a', description: 'Toggle accessibility mode', category: 'help' },
];

/**
 * Hook for quiz-specific keyboard shortcuts
 */
export function useQuizKeyboardShortcuts(options: QuizKeyboardShortcutsOptions = {}) {
  const {
    onNextQuestion,
    onPreviousQuestion,
    onSubmitQuiz,
    onSelectAnswer,
    onToggleExplanations,
    onJumpToQuestion,
    onExitQuiz,
    onShowHelp,
    enabled = true,
    currentQuestionIndex = 0,
    totalQuestions = 0,
    canSubmit = false,
    isCompleted = false,
  } = options;

  const handleGoToQuestion = useCallback(() => {
    if (!onJumpToQuestion) return;
    
    const questionNumber = prompt(
      `Go to question (1-${totalQuestions}):`
    );
    
    if (questionNumber) {
      const index = parseInt(questionNumber, 10) - 1;
      if (index >= 0 && index < totalQuestions) {
        onJumpToQuestion(index);
      }
    }
  }, [onJumpToQuestion, totalQuestions]);

  const shortcuts = {
    // Navigation shortcuts
    'ArrowRight': () => {
      if (onNextQuestion && currentQuestionIndex < totalQuestions - 1) {
        onNextQuestion();
      }
    },
    'ArrowLeft': () => {
      if (onPreviousQuestion && currentQuestionIndex > 0) {
        onPreviousQuestion();
      }
    },
    'Home': () => {
      if (onJumpToQuestion) {
        onJumpToQuestion(0);
      }
    },
    'End': () => {
      if (onJumpToQuestion) {
        onJumpToQuestion(totalQuestions - 1);
      }
    },
    'mod+g': handleGoToQuestion,

    // Answer selection shortcuts (numbers)
    '1': () => onSelectAnswer?.(0),
    '2': () => onSelectAnswer?.(1),
    '3': () => onSelectAnswer?.(2),
    '4': () => onSelectAnswer?.(3),

    // Answer selection shortcuts (letters)
    'a': () => onSelectAnswer?.(0),
    'b': () => onSelectAnswer?.(1),
    'c': () => onSelectAnswer?.(2),
    'd': () => onSelectAnswer?.(3),

    // True/False shortcuts
    't': () => {
      // For True/False questions, True is typically the first option
      onSelectAnswer?.(0);
    },
    'f': () => {
      // For True/False questions, False is typically the second option
      onSelectAnswer?.(1);
    },

    // Action shortcuts
    'Enter': () => {
      if (canSubmit && onSubmitQuiz && !isCompleted) {
        onSubmitQuiz();
      }
    },
    'mod+Enter': () => {
      if (onSubmitQuiz && !isCompleted) {
        onSubmitQuiz();
      }
    },
    'Escape': () => {
      if (onExitQuiz) {
        onExitQuiz();
      }
    },
    'mod+r': () => {
      if (isCompleted && onJumpToQuestion) {
        // Restart quiz by going to first question
        onJumpToQuestion(0);
      }
    },
    'e': () => {
      if (isCompleted && onToggleExplanations) {
        onToggleExplanations();
      }
    },

    // Help shortcuts
    'mod+/': () => onShowHelp?.(),
    'alt+h': () => onShowHelp?.(),
  };

  useKeyboardShortcuts(shortcuts, {
    enabled,
    preventDefault: true,
    stopPropagation: true,
  });

  return {
    shortcuts: QUIZ_SHORTCUTS,
    handleGoToQuestion,
  };
}