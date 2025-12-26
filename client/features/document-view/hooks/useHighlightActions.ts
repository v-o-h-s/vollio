import { useUpdateHighlightMutation } from "@/lib/store/apiSlice";
import { useDeleteHighlightMutation } from "@/lib/store/apiSlice";
import { CreateHighlightDTO } from "@vollio/shared";
export const useHighlightActions = () => {
  const [updateHighlight] = useUpdateHighlightMutation();
  const [deleteHighlight] = useDeleteHighlightMutation();

  const handleUpdateAllHighlight = async (
    highlightId: string,
    highlight: Partial<CreateHighlightDTO>
  ) => {
    try {
      const updated = await updateHighlight({
        id: highlightId,
        highlight,
      }).unwrap();
    } catch (error) {
      console.error("Failed to update highlight:", error);
    }
  };

  // handler to delete a highlight
  const handleDeleteAllHighlight = async (highlightId: string) => {
    try {
      await deleteHighlight(highlightId).unwrap();
    } catch (error) {
      console.error("Failed to delete highlight:", error);
    }
  };
  return {
    handleUpdateAllHighlight,
    handleDeleteAllHighlight,
  };
};
