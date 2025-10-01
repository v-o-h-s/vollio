"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorNotification } from "@/components/ui/error-notification";
import toast from "react-hot-toast";
import { QuizPlayerErrorBoundary } from "./QuizErrorBoundary";
import { QuizPlayerSkeleton } from "./QuizLoadingStates";
import { QuizAccessibilityProvider, useQuizAccessibility } from "./QuizAccessibilityProvider";
import { QuizKeyboardShortcutsDialog } from "./QuizKeyboardShortcutsDialog";
import { QuizAccessibilitySettings } from "./QuizAccessibilitySettings";
import { useQuizPlayerErrorHandling } from "@/hooks/use-quiz-error-handling";
import { useQuizKeyboardShortcuts } from "@/hooks/use-quiz-keyboard-shortcuts";
import { Quiz, QuizQuestion, QuizAttempt, QuizQuestionType } from "@/lib/types";
import { QuizResults } from "@/lib/services/quiz-scoring-service";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Flag,
  BookOpen,
  Target,
  Timer,
  Award,
  ArrowRight,
  ArrowLeft,
  Keyboard,
  Accessibility,
  HelpCircle
} from "lucide-react";

interface InteractiveQuizPlayerProps {
  quiz: Quiz;
  questions: QuizQuestion[];
  onComplete: (results: QuizResults) => void;
  onExit?: () => void;
  className?: string;
}

interface QuestionState {
  selectedAnswer: string | null;
  isAnswered: boolean;
  isCorrect?: boolean;
  showExplanation?: boolean;
}

interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, string>;
  questionStates: Record<string, QuestionState>;
  startTime: Date;
  timeElapsed: number;
  isCompleted: boolean;
  showResults: boolean;
  score: number;
  correctAnswers: number;
}

// Inner component that uses accessibility context
function InteractiveQuizPlayerInner({ 
  quiz, 
  questions, 
  onComplete, 
  onExit,
  className 
}: InteractiveQuizPlayerProps) {

  const {
    handleQuizSubmissionError,
    executeWithErrorHandling,
    clearError,
    error: errorHandlingError,
    isRetrying
  } = useQuizPlayerErrorHandling();

  const {
    settings: accessibilitySettings,
    announceQuestionChange,
    announceAnswerSelection,
    announceScoreUpdate,
    announceNavigationChange,
  } = useQuizAccessibility();

  const [quizState, setQuizState] = useState<QuizState>(() => ({
    currentQuestionIndex: 0,
    answers: {},
    questionStates: {},
    startTime: new Date(),
    timeElapsed: 0,
    isCompleted: false,
    showResults: false,
    score: 0,
    correctAnswers: 0,
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);

  const currentQuestion = questions[quizState.currentQuestionIndex];
  const currentQuestionState = quizState.questionStates[currentQuestion?.id] || {
    selectedAnswer: null,
    isAnswered: false,
  };

  // Timer effect
  useEffect(() => {
    if (quizState.isCompleted) return;

    const interval = setInterval(() => {
      setQuizState(prev => ({
        ...prev,
        timeElapsed: Math.floor((Date.now() - prev.startTime.getTime()) / 1000)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [quizState.isCompleted]);

  // Format time display
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Auto-save progress periodically
  useEffect(() => {
    if (!autoSaveEnabled || quizState.isCompleted) return;

    const interval = setInterval(() => {
      const answeredCount = Object.keys(quizState.answers).length;
      if (answeredCount > 0) {
        // Save progress to localStorage as backup
        try {
          localStorage.setItem(`quiz-progress-${quiz.id}`, JSON.stringify({
            answers: quizState.answers,
            currentQuestionIndex: quizState.currentQuestionIndex,
            timeElapsed: quizState.timeElapsed,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.warn('Failed to save quiz progress:', error);
        }
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(interval);
  }, [quiz.id, quizState.answers, quizState.currentQuestionIndex, quizState.timeElapsed, quizState.isCompleted, autoSaveEnabled]);

  // Load saved progress on mount
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(`quiz-progress-${quiz.id}`);
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        const timeSinceLastSave = Date.now() - progress.timestamp;
        
        // Only restore if saved within last hour
        if (timeSinceLastSave < 60 * 60 * 1000) {
          setQuizState(prev => ({
            ...prev,
            answers: progress.answers || {},
            currentQuestionIndex: progress.currentQuestionIndex || 0,
            questionStates: Object.keys(progress.answers || {}).reduce((states, questionId) => ({
              ...states,
              [questionId]: {
                selectedAnswer: progress.answers[questionId],
                isAnswered: true
              }
            }), {})
          }));
          
          toast.info(
            "Progress Restored",
            "Your previous quiz progress has been restored.",
            {
              label: "Start Fresh",
              onClick: () => {
                localStorage.removeItem(`quiz-progress-${quiz.id}`);
                setQuizState(prev => ({
                  ...prev,
                  answers: {},
                  questionStates: {},
                  currentQuestionIndex: 0
                }));
              }
            }
          );
        }
      }
    } catch (error) {
      console.warn('Failed to load quiz progress:', error);
    }
  }, [quiz.id, toast]);

  // Handle answer selection
  const handleAnswerSelect = useCallback((answer: string) => {
    if (quizState.isCompleted) return;

    const questionId = currentQuestion.id;
    
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: answer
      },
      questionStates: {
        ...prev.questionStates,
        [questionId]: {
          selectedAnswer: answer,
          isAnswered: true,
        }
      }
    }));

    // Announce answer selection for accessibility
    announceAnswerSelection(answer);

    // Clear any previous errors when user interacts
    if (error) {
      setError(null);
      clearError();
    }
  }, [currentQuestion?.id, quizState.isCompleted, error, clearError, announceAnswerSelection]);

  // Handle answer selection by index (for keyboard shortcuts)
  const handleAnswerSelectByIndex = useCallback((index: number) => {
    if (quizState.isCompleted || !currentQuestion) return;

    let answer: string | undefined;

    if (currentQuestion.questionType === 'mcq' && currentQuestion.options) {
      answer = currentQuestion.options[index];
    } else if (currentQuestion.questionType === 'truefalse') {
      const options = ['True', 'False'];
      answer = options[index];
    }

    if (answer) {
      handleAnswerSelect(answer);
    }
  }, [currentQuestion, quizState.isCompleted, handleAnswerSelect]);

  // Navigate to next question
  const handleNextQuestion = useCallback(() => {
    if (quizState.currentQuestionIndex < questions.length - 1) {
      const newIndex = quizState.currentQuestionIndex + 1;
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: newIndex
      }));
      announceQuestionChange(newIndex + 1, questions.length);
      announceNavigationChange(`Moved to question ${newIndex + 1}`);
    }
  }, [quizState.currentQuestionIndex, questions.length, announceQuestionChange, announceNavigationChange]);

  // Navigate to previous question
  const handlePreviousQuestion = useCallback(() => {
    if (quizState.currentQuestionIndex > 0) {
      const newIndex = quizState.currentQuestionIndex - 1;
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: newIndex
      }));
      announceQuestionChange(newIndex + 1, questions.length);
      announceNavigationChange(`Moved to question ${newIndex + 1}`);
    }
  }, [quizState.currentQuestionIndex, announceQuestionChange, announceNavigationChange, questions.length]);

  // Jump to specific question
  const handleQuestionJump = useCallback((index: number) => {
    if (index >= 0 && index < questions.length && index !== quizState.currentQuestionIndex) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: index
      }));
      announceQuestionChange(index + 1, questions.length);
      announceNavigationChange(`Jumped to question ${index + 1}`);
    }
  }, [questions.length, quizState.currentQuestionIndex, announceQuestionChange, announceNavigationChange]);

  // Calculate results
  const calculateResults = useCallback(() => {
    let correctCount = 0;
    const updatedQuestionStates = { ...quizState.questionStates };

    questions.forEach(question => {
      const userAnswer = quizState.answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        correctCount++;
      }

      updatedQuestionStates[question.id] = {
        ...updatedQuestionStates[question.id],
        isCorrect,
        showExplanation: true,
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);

    return {
      correctCount,
      score,
      updatedQuestionStates,
    };
  }, [questions, quizState.answers, quizState.questionStates]);

  // Submit quiz
  const handleSubmitQuiz = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    const submissionToastId = toast.loading(
      "Submitting Quiz",
      "Calculating your score and saving results..."
    );

    try {
      await executeWithErrorHandling(async () => {
        const { correctCount, score, updatedQuestionStates } = calculateResults();

        setQuizState(prev => ({
          ...prev,
          isCompleted: true,
          showResults: true,
          score,
          correctAnswers: correctCount,
          questionStates: updatedQuestionStates,
        }));

        // The parent component will handle the actual submission to the API
        // and receive the full QuizResults from the scoring service
        const basicResults: QuizResults = {
          quizId: quiz.id,
          userId: quiz.userId,
          totalScore: score,
          totalPoints: correctCount,
          maxPoints: questions.length,
          correctAnswers: correctCount,
          totalQuestions: questions.length,
          timeTaken: quizState.timeElapsed,
          completedAt: new Date().toISOString(),
          questionResults: questions.map(question => {
            const userAnswer = quizState.answers[question.id] || '';
            const isCorrect = userAnswer === question.correctAnswer;
            return {
              questionId: question.id,
              questionText: question.questionText,
              questionType: question.questionType,
              userAnswer,
              correctAnswer: question.correctAnswer,
              isCorrect,
              explanation: question.explanation,
              points: isCorrect ? 1 : 0,
              maxPoints: 1,
              difficulty: question.difficulty,
              sourcePages: question.sourcePages,
            };
          }),
          analytics: {
            difficultyBreakdown: {},
            questionTypeBreakdown: {
              mcq: { correct: 0, total: 0 },
              truefalse: { correct: 0, total: 0 },
              fillblank: { correct: 0, total: 0 },
            },
            strongAreas: [],
            weakAreas: [],
          },
        };

        await onComplete(basicResults);

        // Clear saved progress
        localStorage.removeItem(`quiz-progress-${quiz.id}`);

        // Announce score for accessibility
        announceScoreUpdate(correctCount, questions.length);

        // Update toast to show success
        toast.update(submissionToastId, {
          type: 'success',
          title: 'Quiz Submitted!',
          description: `You scored ${score}% (${correctCount}/${questions.length} correct)`,
          duration: 5000
        });
      }, {
        component: 'QuizPlayer',
        action: 'submit_quiz',
        quizId: quiz.id
      });
    } catch (error) {
      // Update toast to show error
      toast.update(submissionToastId, {
        type: 'error',
        title: 'Submission Failed',
        description: 'Your answers are saved locally. Please try again.',
        duration: 8000,
        action: {
          label: 'Retry',
          onClick: () => handleSubmitQuiz()
        }
      });

      setError(error instanceof Error ? error.message : 'Failed to submit quiz');
      handleQuizSubmissionError(error, quiz.id);
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, questions, quizState.answers, quizState.timeElapsed, onComplete, calculateResults, executeWithErrorHandling, handleQuizSubmissionError, toast]);

  // Check if quiz can be submitted
  const canSubmit = questions.every(q => quizState.answers[q.id]);

  // Get progress percentage
  const progressPercentage = ((quizState.currentQuestionIndex + 1) / questions.length) * 100;

  // Get answered questions count
  const answeredCount = Object.keys(quizState.answers).length;

  // Setup keyboard shortcuts
  useQuizKeyboardShortcuts({
    onNextQuestion: handleNextQuestion,
    onPreviousQuestion: handlePreviousQuestion,
    onSubmitQuiz: canSubmit ? handleSubmitQuiz : undefined,
    onSelectAnswer: handleAnswerSelectByIndex,
    onJumpToQuestion: handleQuestionJump,
    onExitQuiz: onExit,
    onShowHelp: () => setShowKeyboardShortcuts(true),
    enabled: !quizState.isCompleted && accessibilitySettings.keyboardNavigation,
    currentQuestionIndex: quizState.currentQuestionIndex,
    totalQuestions: questions.length,
    canSubmit,
    isCompleted: quizState.isCompleted,
  });

  // Setup global keyboard shortcuts for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle accessibility settings with Ctrl+Shift+A
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        setShowAccessibilitySettings(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center p-8">
        <ErrorNotification
          title="No Questions Available"
          message="This quiz doesn't have any questions to display."
          onRetry={onExit}
        />
      </div>
    );
  }

  return (
    <QuizPlayerErrorBoundary>
      <div 
        className={`max-w-4xl mx-auto space-y-6 quiz-container ${className}`}
        role="main"
        aria-label="Interactive Quiz Player"
      >
        {/* Accessibility Dialogs */}
        <QuizKeyboardShortcutsDialog
          open={showKeyboardShortcuts}
          onOpenChange={setShowKeyboardShortcuts}
          currentQuestionType={currentQuestion?.questionType}
          isCompleted={quizState.isCompleted}
        />
        
        <QuizAccessibilitySettings
          open={showAccessibilitySettings}
          onOpenChange={setShowAccessibilitySettings}
        />

        {/* Screen reader instructions */}
        <div className="sr-only" aria-live="polite">
          Quiz instructions: Use arrow keys to navigate between questions, 
          number keys 1-4 or letters A-D to select answers, 
          Enter to submit when ready, and Escape to exit.
        </div>
      {/* Quiz Header */}
      <Card role="banner">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl" id="quiz-title">{quiz.title}</CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2" id="quiz-meta">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  <span aria-label={`${questions.length} questions total`}>
                    {questions.length} questions
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4" aria-hidden="true" />
                  <span aria-label={`Difficulty level: ${quiz.difficulty}`}>
                    {quiz.difficulty}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Timer className="h-4 w-4" aria-hidden="true" />
                  <span aria-label={`Time elapsed: ${formatTime(quizState.timeElapsed)}`}>
                    {formatTime(quizState.timeElapsed)}
                  </span>
                </span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Accessibility buttons */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKeyboardShortcuts(true)}
                aria-label="Show keyboard shortcuts"
                title="Show keyboard shortcuts (Ctrl+/)"
              >
                <Keyboard className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAccessibilitySettings(true)}
                aria-label="Open accessibility settings"
                title="Open accessibility settings (Ctrl+Shift+A)"
              >
                <Accessibility className="h-4 w-4" />
              </Button>
              {onExit && (
                <Button 
                  variant="outline" 
                  onClick={onExit}
                  aria-label="Exit quiz"
                >
                  Exit Quiz
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="space-y-2" role="region" aria-label="Quiz Progress">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span aria-live="polite">
                Question {quizState.currentQuestionIndex + 1} of {questions.length}
              </span>
              <span aria-live="polite">
                {answeredCount}/{questions.length} answered
              </span>
            </div>
            <Progress 
              value={progressPercentage} 
              className="h-2 quiz-progress-bar" 
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Quiz progress: ${Math.round(progressPercentage)}% complete`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <ErrorNotification
          title="Quiz Error"
          message={error}
          onDismiss={() => {
            setError(null);
            clearError();
          }}
          onRetry={() => {
            setError(null);
            clearError();
            if (canSubmit && !quizState.isCompleted) {
              handleSubmitQuiz();
            }
          }}
        />
      )}

      {/* Auto-save Status */}
      {autoSaveEnabled && !quizState.isCompleted && Object.keys(quizState.answers).length > 0 && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            <CheckCircle className="h-3 w-3 text-green-500" />
            Progress auto-saved
          </div>
        </div>
      )}

      {/* Question Navigation */}
      <Card role="navigation" aria-label="Question Navigation">
        <CardContent className="pt-6">
          <div className="sr-only">
            Use the following buttons to jump to specific questions, or use Ctrl+G to go to a question number.
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Question numbers">
            {questions.map((_, index) => {
              const isAnswered = questions[index] && quizState.answers[questions[index].id];
              const isCurrent = index === quizState.currentQuestionIndex;
              
              return (
                <Button
                  key={index}
                  variant={isCurrent ? "default" : isAnswered ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => handleQuestionJump(index)}
                  className={`w-10 h-10 p-0 quiz-navigation-button ${
                    isAnswered && !isCurrent ? "bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700" : ""
                  }`}
                  aria-label={`Go to question ${index + 1}${isCurrent ? ' (current)' : ''}${isAnswered ? ' (answered)' : ' (not answered)'}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {index + 1}
                  {isAnswered && !isCurrent && (
                    <CheckCircle className="h-3 w-3 ml-1 text-green-600 dark:text-green-400" aria-hidden="true" />
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Question */}
      <Card 
        role="region" 
        aria-labelledby="current-question-title"
        className={`quiz-question quiz-question-type-${currentQuestion.questionType}`}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2" role="group" aria-label="Question metadata">
                <Badge variant="outline" aria-label={`Question ${quizState.currentQuestionIndex + 1} of ${questions.length}`}>
                  Question {quizState.currentQuestionIndex + 1}
                </Badge>
                <Badge variant="secondary" aria-label={`Question type: ${currentQuestion.questionType}`}>
                  {currentQuestion.questionType.toUpperCase()}
                </Badge>
                <Badge variant="outline" aria-label={`Difficulty: ${currentQuestion.difficulty}`}>
                  {currentQuestion.difficulty}
                </Badge>
              </div>
              <CardTitle 
                id="current-question-title"
                className="text-xl leading-relaxed"
                role="heading"
                aria-level={2}
              >
                {currentQuestion.questionText}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Answer Options */}
          <div className="space-y-3 quiz-options">
            {/* Keyboard hint for answer selection */}
            <div className="keyboard-hint">
              Use number keys 1-4 or letters A-D to select answers quickly.
            </div>
            
            {currentQuestion.questionType === 'mcq' && currentQuestion.options && (
              <fieldset className="space-y-2">
                <legend className="sr-only">
                  Multiple choice question with {currentQuestion.options.length} options. 
                  Select one answer.
                </legend>
                <div 
                  role="radiogroup" 
                  aria-labelledby="current-question-title"
                  aria-describedby="mcq-instructions"
                >
                  <div id="mcq-instructions" className="sr-only">
                    Use arrow keys to navigate options, space to select, or press the number/letter key for each option.
                  </div>
                  {currentQuestion.options.map((option, index) => {
                    const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
                    const isSelected = currentQuestionState.selectedAnswer === option;
                    const isCorrect = quizState.showResults && option === currentQuestion.correctAnswer;
                    const isIncorrect = quizState.showResults && isSelected && option !== currentQuestion.correctAnswer;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={quizState.isCompleted}
                        role="radio"
                        aria-checked={isSelected}
                        aria-describedby={quizState.showResults ? `option-${index}-result` : undefined}
                        aria-label={`Option ${optionLabel}: ${option}${isSelected ? ' (selected)' : ''}`}
                        className={`w-full p-4 text-left border rounded-lg transition-colors quiz-question-option ${
                          isSelected && !quizState.showResults
                            ? "border-primary bg-primary/5 selected"
                            : isCorrect && quizState.showResults
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20 correct"
                            : isIncorrect && quizState.showResults
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20 incorrect"
                            : "border-border hover:border-primary/50"
                        }`}
                        tabIndex={0}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                            isSelected && !quizState.showResults
                              ? "border-primary bg-primary text-primary-foreground"
                              : isCorrect && quizState.showResults
                              ? "border-green-500 bg-green-500 text-white"
                              : isIncorrect && quizState.showResults
                              ? "border-red-500 bg-red-500 text-white"
                              : "border-muted-foreground"
                          }`} aria-hidden="true">
                            {quizState.showResults ? (
                              isCorrect ? <CheckCircle className="h-4 w-4" /> : 
                              isIncorrect ? <XCircle className="h-4 w-4" /> : 
                              optionLabel
                            ) : (
                              optionLabel
                            )}
                          </div>
                          <span className="flex-1">{option}</span>
                        </div>
                        {quizState.showResults && (
                          <div id={`option-${index}-result`} className="sr-only">
                            {isCorrect ? 'Correct answer' : isIncorrect ? 'Incorrect answer' : 'Not selected'}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {currentQuestion.questionType === 'truefalse' && (
              <fieldset className="space-y-2">
                <legend className="sr-only">
                  True or false question. Select either True or False.
                </legend>
                <div 
                  role="radiogroup" 
                  aria-labelledby="current-question-title"
                  aria-describedby="truefalse-instructions"
                >
                  <div id="truefalse-instructions" className="sr-only">
                    Press T for True or F for False, or use arrow keys to navigate and space to select.
                  </div>
                  {['True', 'False'].map((option, index) => {
                    const isSelected = currentQuestionState.selectedAnswer === option;
                    const isCorrect = quizState.showResults && option === currentQuestion.correctAnswer;
                    const isIncorrect = quizState.showResults && isSelected && option !== currentQuestion.correctAnswer;
                    
                    return (
                      <button
                        key={option}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={quizState.isCompleted}
                        role="radio"
                        aria-checked={isSelected}
                        aria-describedby={quizState.showResults ? `tf-option-${index}-result` : undefined}
                        aria-label={`${option}${isSelected ? ' (selected)' : ''}`}
                        className={`w-full p-4 text-left border rounded-lg transition-colors quiz-question-option ${
                          isSelected && !quizState.showResults
                            ? "border-primary bg-primary/5 selected"
                            : isCorrect && quizState.showResults
                            ? "border-green-500 bg-green-50 dark:bg-green-900/20 correct"
                            : isIncorrect && quizState.showResults
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20 incorrect"
                            : "border-border hover:border-primary/50"
                        }`}
                        tabIndex={0}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                            isSelected && !quizState.showResults
                              ? "border-primary bg-primary text-primary-foreground"
                              : isCorrect && quizState.showResults
                              ? "border-green-500 bg-green-500 text-white"
                              : isIncorrect && quizState.showResults
                              ? "border-red-500 bg-red-500 text-white"
                              : "border-muted-foreground"
                          }`} aria-hidden="true">
                            {quizState.showResults ? (
                              isCorrect ? <CheckCircle className="h-4 w-4" /> : 
                              isIncorrect ? <XCircle className="h-4 w-4" /> : 
                              option[0]
                            ) : (
                              option[0]
                            )}
                          </div>
                          <span className="flex-1">{option}</span>
                        </div>
                        {quizState.showResults && (
                          <div id={`tf-option-${index}-result`} className="sr-only">
                            {isCorrect ? 'Correct answer' : isIncorrect ? 'Incorrect answer' : 'Not selected'}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            {currentQuestion.questionType === 'fillblank' && (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <label htmlFor="fill-blank-input" className="text-sm text-muted-foreground mb-2 block">
                    Type your answer below:
                  </label>
                  <input
                    id="fill-blank-input"
                    type="text"
                    value={currentQuestionState.selectedAnswer || ''}
                    onChange={(e) => handleAnswerSelect(e.target.value)}
                    disabled={quizState.isCompleted}
                    placeholder="Enter your answer..."
                    className="w-full p-3 border rounded-lg bg-background"
                    aria-describedby="fill-blank-instructions"
                    aria-label="Your answer for the fill-in-the-blank question"
                    autoComplete="off"
                  />
                  <div id="fill-blank-instructions" className="sr-only">
                    Type your answer in the text field. Your answer will be automatically saved as you type.
                  </div>
                </div>
                
                {quizState.showResults && (
                  <div className="space-y-2">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Correct Answer: {currentQuestion.correctAnswer}
                      </p>
                    </div>
                    {currentQuestionState.selectedAnswer && (
                      <div className={`p-3 border rounded-lg ${
                        currentQuestionState.isCorrect
                          ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                      }`}>
                        <p className={`text-sm font-medium ${
                          currentQuestionState.isCorrect
                            ? "text-green-800 dark:text-green-200"
                            : "text-red-800 dark:text-red-200"
                        }`}>
                          Your Answer: {currentQuestionState.selectedAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Explanation (shown after completion) */}
          {quizState.showResults && currentQuestion.explanation && (
            <div 
              className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg quiz-explanation"
              role="region"
              aria-labelledby="explanation-heading"
            >
              <h4 
                id="explanation-heading"
                className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
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

      {/* Navigation and Submit */}
      <Card role="navigation" aria-label="Quiz Navigation and Actions">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={quizState.currentQuestionIndex === 0}
              className="flex items-center gap-2 quiz-navigation-button"
              aria-label={`Go to previous question${quizState.currentQuestionIndex === 0 ? ' (disabled - already at first question)' : ''}`}
              aria-disabled={quizState.currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </Button>

            <div className="flex items-center gap-4">
              {!quizState.isCompleted && (
                <div className="text-center" role="status" aria-live="polite">
                  <p className="text-sm text-muted-foreground">
                    {answeredCount}/{questions.length} questions answered
                  </p>
                  {canSubmit && (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={isSubmitting || isRetrying}
                      className="mt-2 quiz-submit-button"
                      aria-describedby="submit-instructions"
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2 quiz-loading-spinner" aria-hidden="true" />
                          <span>Submitting...</span>
                          <span className="sr-only">Please wait while your quiz is being submitted</span>
                        </>
                      ) : isRetrying ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2 quiz-loading-spinner" aria-hidden="true" />
                          <span>Retrying...</span>
                          <span className="sr-only">Retrying quiz submission</span>
                        </>
                      ) : (
                        <>
                          <Flag className="h-4 w-4 mr-2" aria-hidden="true" />
                          Submit Quiz
                        </>
                      )}
                    </Button>
                  )}
                  <div id="submit-instructions" className="sr-only">
                    Press Enter to submit the quiz when all questions are answered, or Ctrl+Enter to force submit.
                  </div>
                </div>
              )}

              {quizState.showResults && (
                <div className="text-center quiz-results-summary" role="status" aria-live="polite">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Award className="h-5 w-5 text-yellow-500" aria-hidden="true" />
                    <span aria-label={`Final score: ${quizState.score} percent`}>
                      Score: {quizState.score}%
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span aria-label={`${quizState.correctAnswers} correct answers out of ${questions.length} total questions`}>
                      {quizState.correctAnswers}/{questions.length} correct
                    </span>
                  </p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleNextQuestion}
              disabled={quizState.currentQuestionIndex === questions.length - 1}
              className="flex items-center gap-2 quiz-navigation-button"
              aria-label={`Go to next question${quizState.currentQuestionIndex === questions.length - 1 ? ' (disabled - already at last question)' : ''}`}
              aria-disabled={quizState.currentQuestionIndex === questions.length - 1}
            >
              Next
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mobile-specific touch navigation hints */}
      <div className="md:hidden">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>💡 Tip: Use the question numbers above to jump between questions</p>
              <p className="mt-1">Press and hold the accessibility button for more options</p>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </QuizPlayerErrorBoundary>
  );
}

// Main component with accessibility provider
export function InteractiveQuizPlayer(props: InteractiveQuizPlayerProps) {
  return (
    <QuizAccessibilityProvider>
      <InteractiveQuizPlayerInner {...props} />
    </QuizAccessibilityProvider>
  );
}