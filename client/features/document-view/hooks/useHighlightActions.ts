import { useUpdateHighlightMutation } from "@/lib/store/apiSlice";
import { useDeleteHighlightMutation } from "@/lib/store/apiSlice";
import { CreateHighlightDTO } from "@vollio/shared";

/**
 * Provides actions for managing individual PDF highlights, including updating
 * their properties (color, tags, notes) and deleting them.
 */
export const useHighlightActions = () => {
  const [updateHighlight] = useUpdateHighlightMutation();
  const [deleteHighlight] = useDeleteHighlightMutation();

  /**
   * Updates an existing highlight's metadata (e.g., color, tags, or linked note content)
   * in the database via RTK Query mutation.
   */
  const updateHighlightMetadata = async (
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

  /**
   * Permanently removes a highlight from the document by its unique ID.
   */
  const removeHighlight = async (highlightId: string) => {
    try {
      await deleteHighlight(highlightId).unwrap();
    } catch (error) {
      console.error("Failed to delete highlight:", error);
    }
  };

  return {
    updateHighlightMetadata,
    removeHighlight,
  };
};