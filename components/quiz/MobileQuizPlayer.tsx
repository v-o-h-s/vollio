"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorNotification } from "@/components/ui/error-notification";
import { useToastActions } from "@/components/ui/toast";
import { QuizPlayerErrorBoundary } from "./QuizErrorBoundary";
import { useQuizPlayerErrorHandling } from "@/hooks/use-quiz-error-handling";
import { useTouchGestures } from "@/hooks/use-touch-gestures";
import { Quiz, QuizQuestion } from "@/lib/types";
import { QuizResults } from "@/lib/services/quiz-scoring-service";
import { 
  CheckCircle, 
  XCircle, 
  Flag,
  BookOpen,
  Timer,
  Award,
  ArrowLeft,
  ArrowRight,
  X,
  MoreHorizontal
} from "lucide-react";

interface MobileQuizPlayerProps {
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

export function MobileQuizPlayer({ 
  quiz, 
  questions, 
  onComplete, 
  onExit,
  className 
}: MobileQuizPlayerProps) {
  const toast = useToastActions();
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    handleQuizSubmissionError,
    executeWithErrorHandling,
    clearError,
    error: errorHandlingError,
    isRetrying
  } = useQuizPlayerErrorHandling();

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
  const [showQuestionOverview, setShowQuestionOverview] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[quizState.currentQuestionIndex];
  const currentQuestionState = quizState.questionStates[currentQuestion?.id] || {
    selectedAnswer: null,
    isAnswered: false,
  };

  // Touch gestures for navigation
  const { attachGestures } = useTouchGestures({
    onSwipe: (gesture) => {
      if (showQuestionOverview || showExplanation) return;
      
      if (gesture.direction === 'left' && quizState.currentQuestionIndex < questions.length - 1) {
        handleNextQuestion();
        if ('vibrate' in navigator) navigator.vibrate(30);
      } else if (gesture.direction === 'right' && quizState.currentQuestionIndex > 0) {
        handlePreviousQuestion();
        if ('vibrate' in navigator) navigator.vibrate(30);
      }
    }
  }, {
    swipeThreshold: 60,
    velocityThreshold: 0.3
  });

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

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleAnswerSelect = useCallback((answer: string) => {
    if (quizState.isCompleted) return;
    const questionId = currentQuestion.id;
    
    setQuizState(prev => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: answer },
      questionStates: {
        ...prev.questionStates,
        [questionId]: { selectedAnswer: answer, isAnswered: true }
      }
    }));

    if ('vibrate' in navigator) navigator.vibrate(50);
    if (error) { setError(null); clearError(); }
  }, [currentQuestion?.id, quizState.isCompleted, error, clearError]);

  const handleNextQuestion = useCallback(() => {
    if (quizState.currentQuestionIndex < questions.length - 1) {
      setQuizState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
      setShowExplanation(false);
    }
  }, [quizState.currentQuestionIndex, questions.length]);

  const handlePreviousQuestion = useCallback(() => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex - 1 }));
      setShowExplanation(false);
    }
  }, [quizState.currentQuestionIndex]);

  const handleQuestionJump = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setQuizState(prev => ({ ...prev, currentQuestionIndex: index }));
      setShowQuestionOverview(false);
      setShowExplanation(false);
    }
  }, [questions.length]);

  const calculateResults = useCallback(() => {
    let correctCount = 0;
    const updatedQuestionStates = { ...quizState.questionStates };

    questions.forEach(question => {
      const userAnswer = quizState.answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) correctCount++;
      updatedQuestionStates[question.id] = {
        ...updatedQuestionStates[question.id],
        isCorrect,
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);
    return { correctCount, score, updatedQuestionStates };
  }, [questions, quizState.answers, quizState.questionStates]);

  const handleSubmitQuiz = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    const submissionToastId = toast.loading("Submitting Quiz", "Calculating your score...");

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
        localStorage.removeItem(`quiz-progress-${quiz.id}`);

        toast.update(submissionToastId, {
          type: 'success',
          title: 'Quiz Complete!',
          description: `You scored ${score}% (${correctCount}/${questions.length})`,
          duration: 5000
        });

        if ('vibrate' in navigator) navigator.vibrate([100, 50, 100, 50, 100]);
      }, {
        component: 'MobileQuizPlayer',
        action: 'submit_quiz',
        quizId: quiz.id
      });
    } catch (error) {
      toast.update(submissionToastId, {
        type: 'error',
        title: 'Submission Failed',
        description: 'Your answers are saved. Please try again.',
        duration: 8000,
        action: { label: 'Retry', onClick: () => handleSubmitQuiz() }
      });

      setError(error instanceof Error ? error.message : 'Failed to submit quiz');
      handleQuizSubmissionError(error, quiz.id);
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, questions, quizState.answers, quizState.timeElapsed, onComplete, calculateResults, executeWithErrorHandling, handleQuizSubmissionError, toast]);

  const canSubmit = questions.every(q => quizState.answers[q.id]);
  const progressPercentage = ((quizState.currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(quizState.answers).length;

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
      <div className={`min-h-screen bg-background ${className}`} ref={containerRef}>
        {/* Mobile Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {onExit && (
                <Button variant="ghost" size="sm" onClick={onExit}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h1 className="font-semibold text-lg truncate max-w-[200px]">{quiz.title}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Timer className="h-3 w-3" />
                  {formatTime(quizState.timeElapsed)}
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={() => setShowQuestionOverview(true)}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="px-4 pb-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Question {quizState.currentQuestionIndex + 1} of {questions.length}</span>
              <span>{answeredCount}/{questions.length} answered</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4">
            <ErrorNotification
              title="Quiz Error"
              message={error}
              onDismiss={() => { setError(null); clearError(); }}
              onRetry={() => {
                setError(null);
                clearError();
                if (canSubmit && !quizState.isCompleted) handleSubmitQuiz();
              }}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="p-4 pb-24" ref={attachGestures}>
          {/* Question Card */}
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs">Q{quizState.currentQuestionIndex + 1}</Badge>
                    <Badge variant="secondary" className="text-xs">{currentQuestion.questionType.toUpperCase()}</Badge>
                    <Badge variant="outline" className="text-xs">{currentQuestion.difficulty}</Badge>
                  </div>
                  <CardTitle className="text-lg leading-relaxed">{currentQuestion.questionText}</CardTitle>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion.questionType === 'mcq' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const optionLabel = String.fromCharCode(65 + index);
                      const isSelected = currentQuestionState.selectedAnswer === option;
                      const isCorrect = quizState.showResults && option === currentQuestion.correctAnswer;
                      const isIncorrect = quizState.showResults && isSelected && option !== currentQuestion.correctAnswer;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={quizState.isCompleted}
                          className={`w-full p-4 text-left border rounded-lg transition-all active:scale-[0.98] ${
                            isSelected && !quizState.showResults
                              ? "border-primary bg-primary/10 shadow-sm"
                              : isCorrect && quizState.showResults
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : isIncorrect && quizState.showResults
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                              isSelected && !quizState.showResults
                                ? "border-primary bg-primary text-primary-foreground"
                                : isCorrect && quizState.showResults
                                ? "border-green-500 bg-green-500 text-white"
                                : isIncorrect && quizState.showResults
                                ? "border-red-500 bg-red-500 text-white"
                                : "border-muted-foreground"
                            }`}>
                              {quizState.showResults ? (
                                isCorrect ? <CheckCircle className="h-4 w-4" /> : 
                                isIncorrect ? <XCircle className="h-4 w-4" /> : 
                                optionLabel
                              ) : (
                                optionLabel
                              )}
                            </div>
                            <span className="flex-1 text-sm leading-relaxed">{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.questionType === 'truefalse' && (
                  <div className="space-y-3">
                    {['True', 'False'].map((option) => {
                      const isSelected = currentQuestionState.selectedAnswer === option;
                      const isCorrect = quizState.showResults && option === currentQuestion.correctAnswer;
                      const isIncorrect = quizState.showResults && isSelected && option !== currentQuestion.correctAnswer;
                      
                      return (
                        <button
                          key={option}
                          onClick={() => handleAnswerSelect(option)}
                          disabled={quizState.isCompleted}
                          className={`w-full p-4 text-left border rounded-lg transition-all active:scale-[0.98] ${
                            isSelected && !quizState.showResults
                              ? "border-primary bg-primary/10 shadow-sm"
                              : isCorrect && quizState.showResults
                              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                              : isIncorrect && quizState.showResults
                              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                              isSelected && !quizState.showResults
                                ? "border-primary bg-primary text-primary-foreground"
                                : isCorrect && quizState.showResults
                                ? "border-green-500 bg-green-500 text-white"
                                : isIncorrect && quizState.showResults
                                ? "border-red-500 bg-red-500 text-white"
                                : "border-muted-foreground"
                            }`}>
                              {quizState.showResults ? (
                                isCorrect ? <CheckCircle className="h-4 w-4" /> : 
                                isIncorrect ? <XCircle className="h-4 w-4" /> : 
                                option[0]
                              ) : (
                                option[0]
                              )}
                            </div>
                            <span className="flex-1 text-sm">{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.questionType === 'fillblank' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-3">Type your answer below:</p>
                      <input
                        type="text"
                        value={currentQuestionState.selectedAnswer || ''}
                        onChange={(e) => handleAnswerSelect(e.target.value)}
                        disabled={quizState.isCompleted}
                        placeholder="Enter your answer..."
                        className="w-full p-3 border rounded-lg bg-background text-base"
                      />
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

              {/* Show Explanation Button */}
              {quizState.showResults && currentQuestion.explanation && (
                <Button
                  variant="outline"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {showExplanation ? 'Hide' : 'Show'} Explanation
                </Button>
              )}

              {/* Explanation */}
              {showExplanation && quizState.showResults && currentQuestion.explanation && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Explanation
                  </h4>
                  <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                  
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

          {/* Swipe Hint */}
          {!quizState.isCompleted && (
            <div className="text-center text-xs text-muted-foreground mb-4">
              💡 Swipe left/right to navigate between questions
            </div>
          )}
        </div>

        {/* Fixed Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={quizState.currentQuestionIndex === 0}
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1 mx-4">
              {!quizState.isCompleted && canSubmit && (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={isSubmitting || isRetrying}
                  className="w-full"
                  size="sm"
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Submitting...
                    </>
                  ) : isRetrying ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <Flag className="h-4 w-4 mr-2" />
                      Submit Quiz
                    </>
                  )}
                </Button>
              )}

              {quizState.showResults && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                    <Award className="h-5 w-5 text-yellow-500" />
                    {quizState.score}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {quizState.correctAnswers}/{questions.length} correct
                  </p>
                </div>
              )}

              {!quizState.isCompleted && !canSubmit && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {answeredCount}/{questions.length} answered
                  </p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleNextQuestion}
              disabled={quizState.currentQuestionIndex === questions.length - 1}
              size="sm"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Question Overview Modal */}
        {showQuestionOverview && (
          <div className="fixed inset-0 z-50 bg-background">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Question Overview</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowQuestionOverview(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-4 space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto">
              {questions.map((question, index) => {
                const isAnswered = quizState.answers[question.id];
                const isCurrent = index === quizState.currentQuestionIndex;
                const isCorrect = quizState.showResults && quizState.questionStates[question.id]?.isCorrect;
                
                return (
                  <button
                    key={question.id}
                    onClick={() => handleQuestionJump(index)}
                    className={`w-full p-4 text-left border rounded-lg transition-colors ${
                      isCurrent 
                        ? "border-primary bg-primary/5" 
                        : isAnswered
                        ? quizState.showResults
                          ? isCorrect
                            ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                            : "border-red-300 bg-red-50 dark:bg-red-900/20"
                          : "border-green-300 bg-green-50 dark:bg-green-900/20"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                        isCurrent
                          ? "border-primary bg-primary text-primary-foreground"
                          : isAnswered
                          ? quizState.showResults
                            ? isCorrect
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-red-500 bg-red-500 text-white"
                            : "border-green-500 bg-green-500 text-white"
                          : "border-muted-foreground"
                      }`}>
                        {quizState.showResults && isAnswered ? (
                          isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />
                        ) : isAnswered ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Question {index + 1}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {question.questionText}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </QuizPlayerErrorBoundary>
  );
}