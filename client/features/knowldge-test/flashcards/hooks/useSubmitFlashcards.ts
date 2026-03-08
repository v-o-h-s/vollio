import { useState } from "react";
import { useGenerateFlashCardsSetMutation } from "@/lib/store/apiSlice";
import {
  FlashcardAutoFormData,
  prepareFlashcardPayload,
} from "../schemas/createFlashCards";
import { toast } from "react-toastify";
import { ErrorName } from "@/lib/shared";
import { TransformedRTKError } from "@/lib/utils/rtk-error-transform";

export const useSubmitFlashcards = () => {
  const [generateSet, { isLoading, error }] =
    useGenerateFlashCardsSetMutation();
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] =
    useState<FlashcardAutoFormData | null>(null);

  const handleSubmit = async (data: FlashcardAutoFormData) => {
    const loadingToast = toast.loading(
      "Generating flashcards... This may take a moment.",
    );
    setLastSubmittedData(data);

    try {
      const response = await generateSet(
        prepareFlashcardPayload("auto", data) as any,
      ).unwrap();

      toast.dismiss(loadingToast);

      const generatedCards =
        (response as any).flashCards?.map((c: any) => ({
          id: c.id || Math.random().toString(),
          front: c.front,
          back: c.back,
          hint: c.hint || "",
        })) || [];

      if (generatedCards.length > 0) {
        toast.success(`Generated ${generatedCards.length} cards!`);
      }

      return {
        generatedCards,
        documentId: data.documentId,
        difficulty: data.difficulty,
      };
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error("Flashcard generation failed:", err);

      // Only show the specific Quota modal for QuotaExceededError
      if (err?.name === ErrorName.QuotaExceededError) {
        setIsErrorModalOpen(true);
      } else {
        setIsErrorModalOpen(false);
      }
      throw err;
    }
  };

  return {
    onSubmit: handleSubmit,
    isLoading,
    error: (error as unknown as TransformedRTKError) || null,
    isErrorModalOpen,
    setIsErrorModalOpen,
    retry: () => lastSubmittedData && handleSubmit(lastSubmittedData),
  };
};
