import { CreateHighlightDTO } from "@shared/validation/highlightSchemas";
import { useUpdateHighlightMutation } from "@/lib/store/apiSlice";
import { useCreateHighlightMutation } from "@/lib/store/apiSlice";
import { useState } from "react";
import { PdfHighlighterUtils } from "react-pdf-highlighter-extended";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";
import { FileDetails } from "@/features/file-view/types/file";
interface useSelectionProps {
  highlighterUtilsRef: React.RefObject<PdfHighlighterUtils | null>;
  file: FileDetails;
  currentHighlightColor?: string;
}

export function useSelection({
  highlighterUtilsRef,
  file,
  currentHighlightColor,
}: useSelectionProps) {
  const [createHighlight] = useCreateHighlightMutation();
  const [pendingSelection, setPendingSelection] = useState<any>(null);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);

  // Handler to add a tag to selected text
  const handleAddTag = () => {
    const selection = highlighterUtilsRef.current?.getCurrentSelection();
    if (!selection) return;

    // Store the selection and open the tag dialog
    setPendingSelection(selection);
    setIsTagDialogOpen(true);
  };

  // Handler when tags are confirmed in the dialog
  const handleTagConfirm = async (selectedTags: string[]) => {
    if (!pendingSelection) return;

    try {
      // Generate a proper UUID for the highlight
      const highlightId = uuidv4();

      // Prepare the DTO for the API with tags
      const newHighlightDto: CreateHighlightDTO = {
        id: highlightId,
        pdfId: file.id,
        type: pendingSelection.content.image ? "area" : "text",
        content: pendingSelection.content,
        position: pendingSelection.position,
        color: currentHighlightColor,
        hasNote: false,
        noteId: null,
        tags: selectedTags,
        style: "tagged",
      };

      // Create the highlight via API
      await createHighlight(newHighlightDto).unwrap();

      toast.success(`Highlight created with ${selectedTags.length} tag(s)`, {
        duration: 2000,
        position: "bottom-right",
      });

      // Clear pending selection
      setPendingSelection(null);
    } catch (error) {
      toast.error("Failed to create highlight with tags. Please try again.", {
        duration: 3000,
        position: "bottom-right",
      });
      console.error("Failed to create highlight with tags:", error);
    }
  };

  // Handler to create a new highlight
  const handleCreateHighlight = async () => {
    const selection = highlighterUtilsRef.current?.getCurrentSelection();
    if (!selection) return;

    try {
      // Generate a proper UUID for the highlight
      const highlightId = uuidv4();

      // Prepare the DTO for the API
      const newHighlightDto: CreateHighlightDTO = {
        id: highlightId,
        pdfId: file.id,
        type: selection.content.image ? "area" : "text",
        content: selection.content,
        position: selection.position,
        color: currentHighlightColor ?? "#FF0000",
        hasNote: false,
        noteId: null,
      };

      // Create the highlight via API
      await createHighlight(newHighlightDto).unwrap();

      // The highlights list will automatically update via RTK Query cache
    } catch (error) {
      // Show error toast
      toast.error("Failed to create highlight. Please try again.", {
        duration: 3000,
        position: "bottom-right",
      });
      console.error("Failed to create highlight:", error);
    }
  };

  // Handler to add a note to selected text
  const handleAddNote = () => {
    const selection = highlighterUtilsRef.current?.getCurrentSelection();
    if (!selection) return;

    // TODO: Implement note input dialog
    console.log("Add note to selection:", selection.content.text);
    toast.success("Note feature coming soon!", {
      duration: 2000,
      position: "bottom-right",
    });
  };

  // Handler to add selected text to summary
  const handleAddToSummary = async () => {
    const selection = highlighterUtilsRef.current?.getCurrentSelection();
    if (!selection || !selection.content.text) return;

    // Note: This function will be enhanced by useSummaryActions hook in BetterViewer
    console.log("Add to summary:", selection.content.text);
    toast.success("Added to summary main points", {
      duration: 2000,
      position: "bottom-right",
    });
  };

  // Handler to copy selected text to clipboard
  const handleCopy = async () => {
    const selection = highlighterUtilsRef.current?.getCurrentSelection();
    if (!selection || !selection.content.text) return;

    try {
      await navigator.clipboard.writeText(selection.content.text);
      toast.success("Text copied to clipboard", {
        duration: 1500,
        position: "bottom-right",
      });
      // Optionally hide selection tip after copy
      highlighterUtilsRef.current?.removeGhostHighlight();
    } catch (error) {
      toast.error("Failed to copy text", {
        duration: 2000,
        position: "bottom-right",
      });
      console.error("Failed to copy text:", error);
    }
  };

  return {
    isTagDialogOpen,
    setIsTagDialogOpen,
    handleAddTag,
    handleTagConfirm,
    handleCreateHighlight,
    handleAddToSummary,
    handleAddNote,
    handleCopy,
  };
}
