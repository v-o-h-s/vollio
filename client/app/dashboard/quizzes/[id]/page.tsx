"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  XCircle,
  RotateCcw,
  Flag,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// Dummy quiz data
const dummyQuiz = {
  id: 1,
  title: "Advanced Calculus Concepts",
  description: "Test your understanding of limits, derivatives, and integrals",
  questions: [
    {
      id: 1,
      question: "What is the derivative of x²?",
      options: ["2x", "x", "2", "x²"],
      correctAnswer: 0,
      explanation: "The derivative of x² is 2x using the power rule."
    },
    {
      id: 2,
      question: "What is the limit of (sin x)/x as x approaches 0?",
      options: ["0", "1", "∞", "undefined"],
      correctAnswer: 1,
      explanation: "This is a fundamental limit in calculus that equals 1."
    },
    {
      id: 3,
      question: "What is ∫x dx?",
      options: ["x²/2 + C", "x + C", "2x + C", "x²"],
      correctAnswer: 0,
      explanation: "The integral of x is x²/2 + C using the power rule for integration."
    }
  ],
  duration: 45,
  difficulty: "Hard",
  category: "Mathematics"
};

export default function QuizDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(dummyQuiz.duration * 60); // Convert to seconds
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmitQuiz();
    }
  }, [timeLeft, quizStarted, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < dummyQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === dummyQuiz.questions[index].correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / dummyQuiz.questions.length) * 100);
  };

  if (!quizStarted) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Button>

          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">{dummyQuiz.title}</CardTitle>
              <CardDescription className="text-base">
                {dummyQuiz.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-muted rounded-lg">
                  <BookOpen className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <div className="font-semibold">{dummyQuiz.questions.length}</div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-green-500" />
                  <div className="font-semibold">{dummyQuiz.duration} min</div>
                  <div className="text-sm text-muted-foreground">Duration</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <Flag className="w-6 h-6 mx-auto mb-2 text-orange-500" />
                  <div className="font-semibold">{dummyQuiz.difficulty}</div>
                  <div className="text-sm text-muted-foreground">Difficulty</div>
                </div>
              </div>

              <div className="text-center">
                <Button 
                  size="lg"
                  onClick={() => setQuizStarted(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8"
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

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-2">Quiz Complete!</CardTitle>
              <CardDescription>
                Here are your results for {dummyQuiz.title}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-orange-500 mb-2">{score}%</div>
                <div className="text-muted-foreground">
                  {selectedAnswers.filter((answer, index) => answer === dummyQuiz.questions[index].correctAnswer).length} out of {dummyQuiz.questions.length} correct
                </div>
              </div>

              <div className="space-y-3">
                {dummyQuiz.questions.map((question, index) => {
                  const isCorrect = selectedAnswers[index] === question.correctAnswer;
                  return (
                    <div key={question.id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium mb-2">{question.question}</div>
                          <div className="text-sm text-muted-foreground">
                            Your answer: {question.options[selectedAnswers[index]] || "Not answered"}
                          </div>
                          {!isCorrect && (
                            <div className="text-sm text-green-600 dark:text-green-400">
                              Correct answer: {question.options[question.correctAnswer]}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => router.push('/dashboard/knowledge-test')}
                >
                  Back to Quizzes
                </Button>
                <Button 
                  onClick={() => {
                    setQuizStarted(false);
                    setShowResults(false);
                    setCurrentQuestion(0);
                    setSelectedAnswers([]);
                    setTimeLeft(dummyQuiz.duration * 60);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
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

  const currentQ = dummyQuiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / dummyQuiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with timer and progress */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit
              </Button>
              <div className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {dummyQuiz.questions.length}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span className={cn(
                  "font-mono",
                  timeLeft < 300 && "text-red-500" // Last 5 minutes
                )}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">
              {currentQ.question}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={cn(
                    "w-full p-4 text-left border rounded-lg transition-all duration-200 hover:border-orange-300 dark:hover:border-orange-700",
                    selectedAnswers[currentQuestion] === index
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/50"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium",
                      selectedAnswers[currentQuestion] === index
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-muted-foreground"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentQuestion === dummyQuiz.questions.length - 1 ? (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={selectedAnswers[currentQuestion] === undefined}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  onClick={handleNextQuestion}
                  disabled={selectedAnswers[currentQuestion] === undefined}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Question Navigator */}
        <Card className="max-w-3xl mx-auto mt-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {dummyQuiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={cn(
                    "w-10 h-10 rounded-lg border text-sm font-medium transition-all duration-200",
                    currentQuestion === index
                      ? "border-orange-500 bg-orange-500 text-white"
                      : selectedAnswers[index] !== undefined
                      ? "border-green-500 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400"
                      : "border-border hover:border-blue-300 dark:hover:border-blue-700 hover:bg-muted/50"
                  )}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}