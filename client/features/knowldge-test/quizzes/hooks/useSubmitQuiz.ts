import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuizCreationFormData } from "../schemas/createQuizSchema";
import { toast } from "react-toastify";
import { useCreateQuizMutation } from "@/lib/store/apiSlice";

export const useSubmitQuiz = () => {
  const router = useRouter();
  const [createQuiz, { isLoading }] = useCreateQuizMutation();
  const [error, setError] = useState<any | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] =
    useState<QuizCreationFormData | null>(null);

  const handleSubmit = async (data: QuizCreationFormData) => {
    const body: any = {
      documentId: data.documentId,
      difficultyLevel: data.difficulty,
      language: data.language,
      explanationLevel: data.explanationLevel,
      numberOfQuestions: data.numberOfQuestions,
    };

    // questionsDistribution: only include numbers
    const dist: Record<string, number> = {};
    if (data.questionsDistribution) {
      Object.entries(data.questionsDistribution).forEach(([k, v]) => {
        if (typeof v === "number" && !Number.isNaN(v) && v > 0) {
          dist[k] = v;
        }
      });
    }
    if (Object.keys(dist).length > 0) body.questionsDistribution = dist;

    await toast.promise(
      createQuiz(body)
        .unwrap()
        .then((res) => {
          if (res?.id) {
            router.push(`/knowledge-test/quizzes/${res.id}`);
          } else {
            router.push("/knowledge-test");
          }
          return res;
        })
        .catch((err) => {
          console.error("Quiz creation failed:", err);
          setError(err);
          setLastSubmittedData(data);
          setIsErrorModalOpen(true);
          throw err;
        }),
      {
        pending: "Creating quiz...",
        success: "Quiz created successfully!",
        error: {
          render({ data }: any) {
            return (
              data?.data?.message || data?.error || "Failed to create quiz"
            );
          },
        },
      },
    );
  };

  return {
    onSubmit: handleSubmit,
    isLoading,
    error,
    isErrorModalOpen,
    setIsErrorModalOpen,
    retry: () => lastSubmittedData && handleSubmit(lastSubmittedData),
  };
};
