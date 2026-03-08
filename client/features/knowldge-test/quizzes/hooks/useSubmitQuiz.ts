import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuizCreationFormData } from "../schemas/createQuizSchema";
import { toast } from "react-toastify";
import { useCreateQuizMutation } from "@/lib/store/apiSlice";
import { TransformedRTKError } from "@/lib/utils/rtk-error-transform";
import { ErrorName } from "@/lib/shared";

export const useSubmitQuiz = () => {
  const router = useRouter();
  const [createQuiz, { isLoading, error }] = useCreateQuizMutation();
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
          setLastSubmittedData(data);

          // Only show the specific Quota modal for QuotaExceededError
          if (err?.name === ErrorName.QuotaExceededError) {
            setIsErrorModalOpen(true);
          } else {
            setIsErrorModalOpen(false);
          }
          // IMPORTANT: We MUST rethrow so toast.promise knows it failed
          throw err;
        }),
      {
        pending: "Creating quiz...",
        success: "Quiz created successfully!",
        error: {
          render({ data }: any) {
            // Since we use transformErrorResponse, 'data' is the TransformedRTKError object
            return data?.message || "Failed to create quiz";
          },
        },
      },
    );
  };

  return {
    onSubmit: handleSubmit,
    isLoading,
    error: (error as TransformedRTKError) || null,
    isErrorModalOpen,
    setIsErrorModalOpen,
    retry: () => lastSubmittedData && handleSubmit(lastSubmittedData),
  };
};
