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
  Clock,
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
import { QuizQuestionsTypeEnum } from "@vollio/shared";
import { MCQQuestion, TrueFalseQuestion } from "@server/domain/entities/Quiz";
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
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Loading your quiz...</p>
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
            <p className="text-muted-foreground max-w-sm">We couldn't load the quiz you're looking for. It might have been deleted or doesn't exist.</p>
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

          <Card className="border-border/60 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="p-3 rounded-full bg-indigo-500/10 text-indigo-500 mb-3">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-2xl">{quiz.questions.length}</div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Questions
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 mb-3">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-2xl">
                    {quiz.settings.timeLimitMinutes || "∞"}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Minutes
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="p-3 rounded-full bg-rose-500/10 text-rose-500 mb-3">
                    <Flag className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-2xl capitalize">
                    {quiz.settings.difficultyLevel || "Medium"}
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-4xl mx-auto px-4 space-y-8">
          <Card className="border-border/60 shadow-xl overflow-hidden">
            <div className={cn(
                "h-3 w-full",
                score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-rose-500"
            )} />
            <CardHeader className="text-center pb-8 pt-10 bg-muted/10">
              <div className="mx-auto mb-6 p-4 rounded-full bg-background shadow-sm ring-1 ring-border">
                <Trophy className={cn(
                    "w-12 h-12",
                    score >= 70 ? "text-emerald-500" : score >= 40 ? "text-amber-500" : "text-rose-500"
                )} />
              </div>
              <CardTitle className="text-3xl font-bold mb-2">Quiz Complete!</CardTitle>
              <CardDescription className="text-lg">
                You scored <span className="font-bold text-foreground">{score}%</span> on {quiz.title}
              </CardDescription>
              
              <div className="mt-8 flex justify-center gap-4">
                 <Badge variant="secondary" className="px-4 py-2 text-sm">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                    {correctCount} Correct
                 </Badge>
                 <Badge variant="secondary" className="px-4 py-2 text-sm">
                    <XCircle className="w-4 h-4 mr-2 text-rose-500" />
                    {quiz.questions.length - correctCount} Incorrect
                 </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-8 px-6 sm:px-10">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Detailed Analysis
              </h3>
              
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
                        "p-5 border rounded-xl transition-all",
                        isCorrect
                          ? "bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/50"
                          : "bg-rose-50/50 border-rose-200 dark:bg-rose-950/10 dark:border-rose-900/50"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className={cn(
                            "mt-0.5 p-1 rounded-full shrink-0",
                            isCorrect ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400" : "bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-400"
                        )}>
                            {isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="font-medium text-base leading-relaxed">
                            <span className="text-muted-foreground mr-2 font-mono text-sm">
                              {String(index + 1).padStart(2, '0')}.
                            </span>
                            {question.text}
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4 text-sm mt-2">
                            <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                              <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                Your Answer
                              </span>
                              <span
                                className={cn(
                                  "font-medium",
                                  isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
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
                              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                                <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                  Correct Answer
                                </span>
                                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                  {correctAnswerLabel}
                                </span>
                              </div>
                            )}
                          </div>

                          {question.explanation && (
                            <div className="mt-3 pt-3 border-t border-border/10 text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-1 font-semibold text-foreground/80">
                                <HelpCircle className="w-4 h-4" /> Explanation
                              </div>
                              {question.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            
            <CardFooter className="bg-muted/10 p-6 flex flex-col sm:flex-row gap-4 justify-center border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={() => router.push("/dashboard/knowledge-test")}
                  className="h-12 px-8 min-w-[160px]"
                >
                  Back to Dashboard
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
                  className="h-12 px-8 min-w-[160px] font-bold shadow-md"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Quiz
                </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // --- QUESTION INTERFACE ---
  const currentQ = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
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
              <span className="text-muted-foreground"> / {quiz.questions.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {timeLeft !== null && (
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-sm border font-medium transition-colors",
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
        <Progress value={progress} className="h-1 w-full rounded-none" />
      </header>

      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8 sm:py-12 flex flex-col">
        <Card className="border-0 shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm">
          <CardHeader className="px-0 sm:px-6 space-y-4">
            <div className="flex justify-between items-start gap-4">
               <Badge variant="outline" className="shrink-0">
                  {currentQ.type === QuizQuestionsTypeEnum.MCQ ? "Multiple Choice" : "True / False"}
               </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-medium leading-relaxed">
              {currentQ.text}
            </h2>
          </CardHeader>

          <CardContent className="px-0 sm:px-6 space-y-8">
            <div className="grid gap-3">
              {currentQ.type === QuizQuestionsTypeEnum.MCQ ? (
                (currentQ as MCQQuestion).options?.map((option, index) => {
                  const isSelected = selectedAnswers[currentQ.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleAnswerSelect(currentQ.id, option.id)}
                      className={cn(
                        "relative w-full p-4 sm:p-5 text-left border-2 rounded-xl transition-all duration-200 group outline-none focus:ring-2 focus:ring-primary/20",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-muted hover:border-primary/50 hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold shrink-0 transition-colors mt-0.5",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/30 text-muted-foreground group-hover:border-primary/50 group-hover:text-primary"
                          )}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className={cn(
                            "text-base leading-relaxed transition-colors",
                            isSelected ? "font-medium text-foreground" : "text-muted-foreground group-hover:text-foreground"
                        )}>
                          {option.text}
                        </span>
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
                          "p-8 border-2 rounded-xl text-center transition-all duration-200 font-bold text-xl outline-none focus:ring-2 focus:ring-offset-2",
                          isSelected
                            ? val
                              ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                              : "border-rose-500 bg-rose-50 text-rose-700 shadow-sm"
                            : "border-muted hover:border-primary/50 hover:bg-muted/30 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {val ? "True" : "False"}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="px-0 sm:px-6 pt-6 flex justify-between items-center">
             <Button
                variant="ghost"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="hover:bg-muted"
             >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
             </Button>

             <div className="hidden sm:flex gap-1.5">
                {quiz.questions.map((_, idx) => (
                    <div 
                        key={idx}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all",
                            idx === currentQuestionIndex ? "bg-primary scale-125" :
                            selectedAnswers[quiz.questions[idx].id] !== undefined ? "bg-primary/40" : "bg-muted"
                        )}
                    />
                ))}
             </div>

             {currentQuestionIndex === quiz.questions.length - 1 ? (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={selectedAnswers[currentQ.id] === undefined}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 px-8"
                >
                  Submit Quiz
                  <CheckCircle className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  disabled={selectedAnswers[currentQ.id] === undefined}
                  className="px-8"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
