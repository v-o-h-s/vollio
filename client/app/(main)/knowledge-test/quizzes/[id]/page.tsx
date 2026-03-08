"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  XCircle,
  RotateCcw,
  Flag,
  ChevronLeft,
  ChevronRight,
  Loader2,
  HelpCircle,
  Trophy,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetQuizQuery } from "@/lib/store/apiSlice";
import {
  QuizQuestionsTypeEnum,
  MCQQuestion,
  TrueFalseQuestion,
} from "@/lib/shared";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Helper type for stored answers
type UserAnswer = string | boolean;

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const {
    data: quiz,
    isLoading,
    isError,
    refetch,
  } = useGetQuizQuery(quizId, {
    skip: !quizId,
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, UserAnswer>
  >({});
  const [showResults, setShowResults] = useState(false);

  const [quizStarted, setQuizStarted] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleAnswerSelect = (questionId: string, answer: UserAnswer) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setIsCalculating(true);
    // Simulate a calculation delay for better UX
    setTimeout(() => {
      setIsCalculating(false);
      setShowResults(true);
      setCurrentQuestionIndex(0); // Return to first question
    }, 2000);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.questions.forEach((q) => {
      const userAnswer = selectedAnswers[q.id];
      if (userAnswer === undefined) return;

      if (q.type === QuizQuestionsTypeEnum.MCQ) {
        const mcqQ = q as MCQQuestion;
        if (
          mcqQ.correctOptionIds &&
          mcqQ.correctOptionIds.includes(userAnswer as string)
        ) {
          correct++;
        }
      } else if (q.type === QuizQuestionsTypeEnum.TRUE_FALSE) {
        const tfQ = q as TrueFalseQuestion;
        if (userAnswer === tfQ.correctAnswer) {
          correct++;
        }
      }
    });

    if (quiz.questions.length === 0) return 0;
    return Math.round((correct / quiz.questions.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin mb-2" />
          <p className="text-foreground font-medium text-lg tracking-tight">
            Loading quiz...
          </p>
          <p className="text-muted-foreground text-sm">
            Preparing your session
          </p>
        </div>
      </div>
    );
  }

  // --- CALCULATION SCREEN ---
  if (isCalculating) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center p-4 bg-background z-50">
        <div className="flex flex-col items-center gap-6 text-center max-w-xs">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="relative p-6 rounded-full bg-primary/10">
              <Trophy className="w-10 h-10 text-primary animate-bounce" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight uppercase italic">
              Calculating Results
            </h2>
            <p className="text-muted-foreground text-sm font-medium">
              Evaluating your performance and preparing your review session...
            </p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center px-4">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Quiz Not Found</h2>
          <p className="text-muted-foreground max-w-sm">
            We couldn't load the quiz you're looking for. It might have been
            deleted or doesn't exist.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // --- START SCREEN ---
  if (!quizStarted) {
    return (
      <div className="min-h-screen flex flex-col bg-background/50">
        <div className="container max-w-3xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="w-fit mb-8 -ml-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="border-border/60 shadow-xl bg-card/20 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r bg-indigo-500" />
            <CardHeader className="text-center pb-8 pt-10">
              <Badge
                variant="outline"
                className="w-fit mx-auto mb-6 px-3 py-1 text-sm border-primary/20 bg-primary/5 text-primary"
              >
                {quiz.language.toUpperCase()}
              </Badge>
              <CardTitle className="text-4xl font-black tracking-tight mb-3">
                {quiz.title || "Untitled Quiz"}
              </CardTitle>
              <CardDescription className="text-lg">
                Ready to test your knowledge?
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-10 pb-10">
              <div className="flex items-center justify-center gap-10 py-6 border-y border-border/40">
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl font-bold">
                    {quiz.questions.length}
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Questions
                  </div>
                </div>

                <div className="h-8 w-px bg-border/40" />
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl font-bold capitalize">
                    {quiz.settings.difficultyLevel || "Medium"}
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Difficulty
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={() => setQuizStarted(true)}
                  className="w-full sm:w-auto min-w-[240px] h-14 text-lg font-bold rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 hover:scale-105"
                >
                  Start Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- RESULTS SCREEN (REVIEW MODE) ---
  if (showResults) {
    const score = calculateScore();
    const currentQ = quiz.questions[currentQuestionIndex];

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Review Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuizStarted(false);
                  setShowResults(false);
                  setCurrentQuestionIndex(0);
                  setSelectedAnswers({});
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Review
              </Button>
              <div className="h-4 w-px bg-border hidden sm:block" />
              <Badge
                variant="outline"
                className="font-bold text-primary border-primary/20 bg-primary/5"
              >
                Score: {score}%
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setQuizStarted(false);
                setShowResults(false);
                setCurrentQuestionIndex(0);
                setSelectedAnswers({});
              }}
              className="rounded-full font-bold"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake
            </Button>
          </div>
        </header>

        <main className="flex-1 container max-w-2xl mx-auto px-4 py-8 flex flex-col justify-center">
          <div className="space-y-10">
            {/* Review Navigator */}
            <div className="flex justify-center flex-wrap gap-3">
              {quiz.questions.map((q, idx) => {
                const userAnswer = selectedAnswers[q.id];
                let isCorrect = false;
                if (q.type === QuizQuestionsTypeEnum.MCQ) {
                  isCorrect = !!(q as MCQQuestion).correctOptionIds?.includes(
                    userAnswer as string,
                  );
                } else {
                  isCorrect =
                    userAnswer === (q as TrueFalseQuestion).correctAnswer;
                }
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ring-offset-4 ring-offset-background",
                      isCurrent ? "ring-2 ring-foreground scale-125" : "",
                      isCorrect ? "bg-emerald-500" : "bg-rose-500",
                    )}
                    title={`Question ${idx + 1}`}
                  />
                );
              })}
            </div>

            {/* Question Content */}
            <div className="space-y-8">
              <div className="space-y-3 text-center">
                <Badge
                  variant="secondary"
                  className="bg-muted/50 text-[10px] py-0 h-5 text-muted-foreground border-none"
                >
                  REVIEW MODE
                </Badge>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
                  {currentQ.text}
                </h2>
              </div>

              <div className="grid gap-3">
                {currentQ.type === QuizQuestionsTypeEnum.MCQ ? (
                  (currentQ as MCQQuestion).options?.map((option: any) => {
                    const isSelected =
                      selectedAnswers[currentQ.id] === option.id;
                    const isCorrect = (
                      currentQ as MCQQuestion
                    ).correctOptionIds?.includes(option.id);

                    return (
                      <div
                        key={option.id}
                        className={cn(
                          "w-full p-4 rounded-xl border-2 text-base font-medium transition-all duration-300",
                          isCorrect
                            ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                            : isSelected && !isCorrect
                              ? "border-rose-500/50 bg-rose-500/5 text-rose-700 dark:text-rose-400 opacity-80"
                              : "border-transparent bg-muted/20 text-muted-foreground opacity-50",
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isCorrect
                                  ? "bg-emerald-500"
                                  : isSelected
                                    ? "bg-rose-500"
                                    : "bg-muted-foreground/30",
                              )}
                            />
                            {option.text}
                          </div>
                          {isCorrect && (
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          )}
                          {isSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {[true, false].map((val) => {
                      const isSelected = selectedAnswers[currentQ.id] === val;
                      const isCorrect =
                        (currentQ as TrueFalseQuestion).correctAnswer === val;

                      return (
                        <div
                          key={String(val)}
                          className={cn(
                            "p-8 rounded-xl text-center font-bold text-lg border-2 transition-all duration-300",
                            isCorrect
                              ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400"
                              : isSelected && !isCorrect
                                ? "border-rose-500/50 bg-rose-500/5 text-rose-700 dark:text-rose-400 opacity-80"
                                : "border-transparent bg-muted/20 text-muted-foreground opacity-50",
                          )}
                        >
                          {val ? "True" : "False"}
                          <div className="flex justify-center mt-2">
                            {isCorrect && (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            )}
                            {isSelected && !isCorrect && (
                              <XCircle className="w-4 h-4 text-rose-500" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {currentQ.explanation && (
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-sm leading-relaxed text-muted-foreground">
                  <div className="flex items-center gap-2 mb-2 font-bold text-primary uppercase tracking-tighter text-[10px]">
                    <HelpCircle className="w-3.5 h-3.5" /> Explanation
                  </div>
                  {currentQ.explanation}
                </div>
              )}
            </div>

            {/* Review Footer Actions */}
            <div className="pt-4 flex justify-between items-center sm:px-2">
              <Button
                variant="ghost"
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                }
                disabled={currentQuestionIndex === 0}
                className="text-muted-foreground hover:text-foreground font-medium rounded-full px-4 h-9 text-xs"
              >
                <ChevronLeft className="w-3 h-3 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground mr-2">
                  {currentQuestionIndex + 1} / {quiz.questions.length}
                </span>
                <Button
                  variant="ghost"
                  onClick={() =>
                    setCurrentQuestionIndex((prev) =>
                      Math.min(quiz.questions.length - 1, prev + 1),
                    )
                  }
                  disabled={currentQuestionIndex === quiz.questions.length - 1}
                  className="text-muted-foreground hover:text-foreground font-medium rounded-full px-4 h-9 text-xs"
                >
                  Next
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  // --- QUESTION INTERFACE ---
  const currentQ = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="text-sm font-medium hidden sm:block">
              <span className="text-muted-foreground">Question</span>{" "}
              <span className="font-bold text-foreground">
                {currentQuestionIndex + 1}
              </span>
              <span className="text-muted-foreground">
                {" "}
                / {quiz.questions.length}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4"></div>
        </div>
        <Progress value={progress} className="h-1 w-full rounded-none" />
      </header>

      <main className="flex-1 container max-w-2xl mx-auto px-4 py-4 sm:py-8 flex flex-col justify-center">
        <div className="space-y-8">
          {/* Question Navigator - Points */}
          <div className="flex justify-center flex-wrap gap-3">
            {quiz.questions.map((_, idx) => {
              const isAnswered =
                selectedAnswers[quiz.questions[idx].id] !== undefined;
              const isCurrent = idx === currentQuestionIndex;

              return (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-500 relative ring-offset-4 ring-offset-background cursor-pointer",
                    isCurrent
                      ? "bg-primary ring-2 ring-primary scale-125"
                      : isAnswered
                        ? "bg-primary/40 hover:bg-primary/60"
                        : "bg-muted hover:bg-muted-foreground/30",
                  )}
                  title={`Question ${idx + 1}`}
                />
              );
            })}
          </div>

          {/* Question Content */}
          <div className="space-y-8">
            <div className="space-y-3 text-center">
              <Badge
                variant="secondary"
                className="bg-muted/50 text-[10px] py-0 h-5 text-muted-foreground border-none uppercase tracking-tighter"
              >
                {currentQ.type === QuizQuestionsTypeEnum.MCQ
                  ? "Multiple Choice"
                  : "True / False"}
              </Badge>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight">
                {currentQ.text}
              </h2>
            </div>

            <div className="grid gap-3">
              {currentQ.type === QuizQuestionsTypeEnum.MCQ ? (
                (currentQ as MCQQuestion).options?.map((option: any) => {
                  const isSelected = selectedAnswers[currentQ.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswerSelect(currentQ.id, option.id)}
                      className={cn(
                        "w-full p-4 text-left rounded-xl transition-all duration-300 border-2 text-base font-medium cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/5 text-foreground shadow-sm"
                          : "border-transparent bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full transition-all duration-300",
                            isSelected
                              ? "bg-primary scale-150"
                              : "bg-muted-foreground/30",
                          )}
                        />
                        {option.text}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {[true, false].map((val) => {
                    const isSelected = selectedAnswers[currentQ.id] === val;
                    return (
                      <button
                        key={String(val)}
                        onClick={() => handleAnswerSelect(currentQ.id, val)}
                        className={cn(
                          "p-8 rounded-xl text-center transition-all duration-300 font-bold text-lg border-2 cursor-pointer",
                          isSelected
                            ? val
                              ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 shadow-sm"
                              : "border-rose-500/30 bg-rose-500/5 text-rose-600 shadow-sm"
                            : "border-transparent bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {val ? "True" : "False"}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex justify-between items-center sm:px-2">
            <Button
              variant="ghost"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="text-muted-foreground hover:text-foreground font-medium rounded-full px-4 h-9 text-xs"
            >
              <ChevronLeft className="w-3 h-3 mr-1" />
              Previous
            </Button>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button
                onClick={handleSubmitQuiz}
                disabled={selectedAnswers[currentQ.id] === undefined}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-full px-8 h-10 text-sm font-bold"
              >
                Complete Quiz
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={selectedAnswers[currentQ.id] === undefined}
                className="rounded-full px-8 h-10 text-sm font-bold shadow-md shadow-primary/10"
              >
                Next Question
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
