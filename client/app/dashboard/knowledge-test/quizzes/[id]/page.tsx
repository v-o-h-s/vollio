"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle,
  XCircle,
  RotateCcw,
  Flag,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetQuizQuery } from "@/lib/store/apiSlice";
import { QuizQuestionsTypeEnum } from "@shared/validation/quizSchemas";
import { MCQQuestion, TrueFalseQuestion } from "@server/domain/entities/Quiz";
import { Badge } from "@/components/ui";

// Helper type for stored answers
// For MCQ: selected option ID(s)
// For True/False: boolean value
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
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  // Initialize timer when quiz starts
  useEffect(() => {
    if (quizStarted && quiz?.settings.timeLimitMinutes && timeLeft === null) {
      setTimeLeft(quiz.settings.timeLimitMinutes * 60);
    }
  }, [quizStarted, quiz, timeLeft]);

  // Timer countdown
  useEffect(() => {
    if (quizStarted && timeLeft !== null && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults && quizStarted) {
      handleSubmitQuiz();
    }
  }, [timeLeft, quizStarted, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.questions.forEach((q) => {
      const userAnswer = selectedAnswers[q.id];
      if (userAnswer === undefined) return;

      if (q.type === QuizQuestionsTypeEnum.MCQ) {
        const mcqQ = q as MCQQuestion;
        // Assuming single choice for now, checking if selected ID is in correctOptionIds
        // If multiple choice allowed, logic needs to check if all correct options are selected
        // For now, let's assume one correct answer for simplicity if data structure implies it,
        // but the type says correctOptionIds string[].
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading quiz...</p>
      </div>
    );
  }

  if (isError || !quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <XCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold">Failed to load quiz</h2>
        <Button onClick={() => refetch()}>Try Again</Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  // --- START SCREEN ---
  if (!quizStarted) {
    return (
      <div className="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Button>

          <Card className="max-w-2xl mx-auto border-t-4 border-t-indigo-500 shadow-lg">
            <CardHeader className="text-center pb-2">
              <Badge
                variant="outline"
                className="w-fit mx-auto mb-4 border-indigo-200 bg-indigo-50 text-indigo-700"
              >
                {quiz.language.toUpperCase()}
              </Badge>
              <CardTitle className="text-3xl mb-2">
                {quiz.title || "Untitled Quiz"}
              </CardTitle>
              <CardDescription className="text-base">
                Generated from your document
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
                  <BookOpen className="w-6 h-6 mx-auto mb-2 text-indigo-500" />
                  <div className="font-bold text-xl">
                    {quiz.questions.length}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Questions
                  </div>
                </div>
                <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                  <div className="font-bold text-xl">
                    {quiz.settings.timeLimitMinutes || "∞"} min
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Duration
                  </div>
                </div>
                <div className="p-4 bg-muted/40 rounded-xl border border-border/50">
                  <Flag className="w-6 h-6 mx-auto mb-2 text-rose-500" />
                  <div className="font-bold text-xl capitalize">
                    {quiz.settings.difficultyLevel || "Medium"}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Difficulty
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <Button
                  size="lg"
                  onClick={() => setQuizStarted(true)}
                  className="w-full sm:w-auto min-w-[200px] h-12 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
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

  // --- RESULTS SCREEN ---
  if (showResults) {
    const score = calculateScore();
    const correctCount = quiz.questions.reduce((acc, q) => {
      const ans = selectedAnswers[q.id];
      let isCorrect = false;
      if (q.type === QuizQuestionsTypeEnum.MCQ) {
        const mcq = q as MCQQuestion;
        isCorrect = !!(
          mcq.correctOptionIds && mcq.correctOptionIds.includes(ans as string)
        );
      } else {
        const tf = q as TrueFalseQuestion;
        isCorrect = ans === tf.correctAnswer;
      }
      return acc + (isCorrect ? 1 : 0);
    }, 0);

    return (
      <div className="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <Card className="max-w-3xl mx-auto border-t-4 border-t-green-500 shadow-xl">
            <CardHeader className="text-center border-b border-border/50 bg-muted/10 pb-8">
              <CardTitle className="text-3xl mb-2">Quiz Complete!</CardTitle>
              <CardDescription>Results for {quiz.title}</CardDescription>
              <div className="mt-6 flex flex-col items-center justify-center">
                <div
                  className={cn(
                    "text-7xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-b",
                    score >= 70
                      ? "from-green-500 to-green-700"
                      : score >= 40
                      ? "from-amber-500 to-amber-700"
                      : "from-red-500 to-red-700"
                  )}
                >
                  {score}%
                </div>
                <Badge variant={score >= 70 ? "default" : "secondary"}>
                  {correctCount} out of {quiz.questions.length} correct
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-8">
              <div className="space-y-4">
                {quiz.questions.map((question, index) => {
                  const userAnswer = selectedAnswers[question.id];
                  let isCorrect = false;
                  let correctAnswerLabel = "";

                  if (question.type === QuizQuestionsTypeEnum.MCQ) {
                    const q = question as MCQQuestion;
                    isCorrect = !!(
                      q.correctOptionIds &&
                      q.correctOptionIds.includes(userAnswer as string)
                    );
                    const correctOpt = q.options.find((o) =>
                      q.correctOptionIds?.includes(o.id)
                    );
                    correctAnswerLabel = correctOpt?.text || "Unknown";
                  } else {
                    const q = question as TrueFalseQuestion;
                    isCorrect = userAnswer === q.correctAnswer;
                    correctAnswerLabel = q.correctAnswer ? "True" : "False";
                  }

                  return (
                    <div
                      key={question.id}
                      className={cn(
                        "p-4 border rounded-xl transition-all",
                        isCorrect
                          ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900"
                          : "bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mt-1 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mt-1 shrink-0" />
                        )}
                        <div className="flex-1 space-y-2">
                          <div className="font-medium text-base">
                            <span className="text-muted-foreground mr-2 text-sm font-bold">
                              Q{index + 1}.
                            </span>
                            {question.text}
                          </div>

                          <div className="pl-6 space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-muted-foreground w-20 text-xs uppercase tracking-wider">
                                Your Answer:
                              </span>
                              <span
                                className={cn(
                                  "font-medium",
                                  isCorrect ? "text-green-700" : "text-red-700"
                                )}
                              >
                                {question.type === QuizQuestionsTypeEnum.MCQ
                                  ? (question as MCQQuestion).options.find(
                                      (o) => o.id === userAnswer
                                    )?.text || "Not answered"
                                  : userAnswer === undefined
                                  ? "Not answered"
                                  : userAnswer
                                  ? "True"
                                  : "False"}
                              </span>
                            </div>

                            {!isCorrect && (
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-muted-foreground w-20 text-xs uppercase tracking-wider">
                                  Correct:
                                </span>
                                <span className="font-medium text-green-700">
                                  {correctAnswerLabel}
                                </span>
                              </div>
                            )}

                            {question.explanation && (
                              <div className="mt-2 pt-2 border-t border-border/50 text-muted-foreground">
                                <span className="font-semibold text-xs uppercase tracking-wider mr-2">
                                  Explanation:
                                </span>
                                {question.explanation}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 justify-center pt-6">
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/knowledge-test")}
                  className="h-12 px-6"
                >
                  Back to Quizzes
                </Button>
                <Button
                  onClick={() => {
                    setQuizStarted(false);
                    setShowResults(false);
                    setCurrentQuestionIndex(0);
                    setSelectedAnswers({});
                    setTimeLeft(
                      quiz.settings.timeLimitMinutes
                        ? quiz.settings.timeLimitMinutes * 60
                        : null
                    );
                  }}
                  className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- QUESTION INTERFACE ---
  const currentQ = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit
              </Button>
              <div className="h-6 w-px bg-border mx-2" />
              <div className="text-sm font-medium text-muted-foreground">
                Question{" "}
                <span className="text-foreground font-bold">
                  {currentQuestionIndex + 1}
                </span>{" "}
                / {quiz.questions.length}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md font-mono font-bold text-sm border",
                    timeLeft < 300
                      ? "bg-red-50 border-red-200 text-red-600 animate-pulse"
                      : "bg-muted/50 border-border text-foreground"
                  )}
                >
                  <Clock className="w-4 h-4" />
                  {formatTime(timeLeft)}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 relative h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32 max-w-4xl">
        <Card className="border-0 shadow-lg ring-1 ring-border/50 bg-card overflow-hidden">
          <CardHeader className="bg-muted/15 pb-8">
            <div className="flex justify-between items-start gap-4">
              <CardTitle className="text-xl leading-relaxed font-medium">
                {currentQ.text}
              </CardTitle>
              <Badge
                variant="outline"
                className="shrink-0 uppercase text-[10px] tracking-wider font-bold"
              >
                {currentQ.type === QuizQuestionsTypeEnum.MCQ
                  ? "Multi Choice"
                  : "True / False"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 md:p-8 space-y-8">
            <div className="space-y-3">
              {currentQ.type === QuizQuestionsTypeEnum.MCQ ? (
                (currentQ as MCQQuestion).options?.map((option, index) => {
                  const isSelected = selectedAnswers[currentQ.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswerSelect(currentQ.id, option.id)}
                      className={cn(
                        "w-full p-4 text-left border-2 rounded-xl transition-all duration-200 group relative overflow-hidden",
                        isSelected
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20"
                          : "border-border hover:border-indigo-300 hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 transition-colors",
                            isSelected
                              ? "border-indigo-500 bg-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                              : "border-muted-foreground/30 text-muted-foreground group-hover:border-indigo-400 group-hover:text-indigo-500"
                          )}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span
                          className={cn(
                            "font-medium transition-colors",
                            isSelected
                              ? "text-indigo-900 dark:text-indigo-100"
                              : "text-foreground"
                          )}
                        >
                          {option.text}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-indigo-500/5 z-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                // TRUE / FALSE
                <div className="grid grid-cols-2 gap-4">
                  {[true, false].map((val) => {
                    const isSelected = selectedAnswers[currentQ.id] === val;
                    return (
                      <button
                        key={String(val)}
                        onClick={() => handleAnswerSelect(currentQ.id, val)}
                        className={cn(
                          "p-6 border-2 rounded-xl text-center transition-all duration-200 font-bold text-lg",
                          isSelected
                            ? val
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-red-500 bg-red-50 text-red-700"
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        {val ? "True" : "False"}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-6 mt-8 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </Button>

              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={selectedAnswers[currentQ.id] === undefined}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 h-12 text-base font-bold shadow-lg shadow-green-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                >
                  Submit Quiz
                  <CheckCircle className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  disabled={selectedAnswers[currentQ.id] === undefined}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 text-base font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
                >
                  Next Question
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigator */}
        <div className="mt-8 flex justify-center">
          <div className="flex flex-wrap gap-2 justify-center max-w-2xl bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200 border",
                  currentQuestionIndex === index
                    ? "border-indigo-500 bg-indigo-500 text-white shadow-md transform scale-110 z-10"
                    : selectedAnswers[quiz.questions[index].id] !== undefined
                    ? "border-green-500/50 bg-green-50 text-green-700"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
