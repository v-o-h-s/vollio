"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorNotification } from "@/components/ui/error-notification";
import { QuizRetakeInterface } from "@/components/quiz";
import { useGetQuizDetailsQuery } from "@/lib/store/apiSlice";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizRetakePageProps {
  params: {
    id: string;
  };
}

export default function QuizRetakePage({ params }: QuizRetakePageProps) {
  const router = useRouter();
  const quizId = params.id;

  // Fetch quiz details
  const {
    data: quizDetails,
    isLoading,
    error,
    refetch
  } = useGetQuizDetailsQuery(quizId);

  // Handle quiz generation completion
  const handleQuizGenerated = (newQuizId: string) => {
    router.push(`/dashboard/quiz/${newQuizId}`);
  };

  // Handle cancel
  const handleCancel = () => {
    router.push(`/dashboard/quiz/${quizId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-muted-foreground">Loading quiz details...</span>
        </div>
      </div>
    );
  }

  if (error || !quizDetails?.data) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Quiz Not Found</h1>
          </div>
        </div>
        
        <ErrorNotification
          title="Failed to Load Quiz"
          message="Unable to load the quiz details for retaking. Please try again."
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Retake Quiz</h1>
          <p className="text-muted-foreground">
            Generate new questions and improve your score
          </p>
        </div>
      </div>

      <QuizRetakeInterface
        originalQuiz={quizDetails.data.quiz}
        onQuizGenerated={handleQuizGenerated}
        onCancel={handleCancel}
      />
    </div>
  );
}