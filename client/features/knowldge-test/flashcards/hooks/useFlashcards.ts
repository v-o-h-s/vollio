import {
  useGetAllFlashCardsSetsQuery,
  useDeleteFlashCardsSetMutation,
} from "@/lib/store/apiSlice";
import { toast } from "react-toastify";

export const useFlashcards = () => {
  const {
    data: flashcardSets = [],
    isLoading,
    isError,
    refetch,
  } = useGetAllFlashCardsSetsQuery();

  const [deleteFlashCardsSetData, { isLoading: isDeleting }] =
    useDeleteFlashCardsSetMutation();

  const deleteFlashcardSet = async (id: string) => {
    try {
      await deleteFlashCardsSetData(id).unwrap();
      toast.success("Flashcard deck deleted successfully");
    } catch (error) {
      console.error("Failed to delete flashcard deck:", error);
      toast.error("Failed to delete flashcard deck");
    }
  };

  return {
    flashcardSets,
    isLoading,
    isError,
    refetch,
    deleteFlashcardSet,
    isDeleting,
  };
};
