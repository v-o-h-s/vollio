import { CreateHighlightDTO } from "@vollio/shared";
import {
  useUpdateHighlightMutation,
  useCreateHighlightMutation,
  useLazyExplainTextQuery,
} from "@/lib/store/apiSlice";
import { useState } from "react";
import { PdfHighlighterUtils } from "react-pdf-highlighter-extended-plus";
import { v4 as uuidv4 } from "uuid";
import { FileDetails } from "@/features/file-view/types/document";
import { toast } from "react-toastify";

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
  const [selection, setSelection] = useState<any>(null);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);

  // AI Explanation State
  const [isExplainOpen, setIsExplainOpen] = useState(false);
  const [triggerExplain, explainResult] = useLazyExplainTextQuery();

  // Helper to sync local selection with viewer selection
  const captureSelection = () => {
    const activeSelection = highlighterUtilsRef.current?.getCurrentSelection();
    if (activeSelection) {
      setSelection(activeSelection);
    }
    return activeSelection;
  };

  // Handler to add a tag to selected text
  const handleAddTag = () => {
    const activeSelection = captureSelection();
    if (!activeSelection) return;
    setIsTagDialogOpen(true);
  };

  const handleExplain = async () => {
    const activeSelection = captureSelection();
    if (!activeSelection || !activeSelection.content?.text) return;

    setIsExplainOpen(true);

    try {
      await triggerExplain(activeSelection.content.text).unwrap();
    } catch (err: any) {
      console.error("AI Explanation Error:", err);
      toast.error(
        err?.data?.message || err?.message || "Failed to generate explanation"
      );
    }
  };

  const handleTagConfirm = async (selectedTags: string[]) => {
    if (!selection) return;

    try {
      const highlightId = uuidv4();
      const newHighlightDto: CreateHighlightDTO = {
        id: highlightId,
        pdfId: file.id,
        type: selection.content.image ? "area" : "text",
        content: selection.content,
        position: selection.position,
        color: currentHighlightColor,
        hasNote: false,
        noteId: null,
        tags: selectedTags,
        style: "tagged",
      };

      await createHighlight(newHighlightDto).unwrap();
      toast.success(`Highlight created with ${selectedTags.length} tag(s)`);
      setSelection(null);
    } catch (error) {
      toast.error("Failed to create highlight with tags.");
    }
  };

  const handleCreateHighlight = async () => {
    const activeSelection = captureSelection();
    if (!activeSelection) return;

    const highlightId = uuidv4();
    const newHighlightDto: CreateHighlightDTO = {
      id: highlightId,
      pdfId: file.id,
      type: activeSelection.content.image ? "area" : "text",
      content: activeSelection.content,
      position: activeSelection.position,
      color: currentHighlightColor ?? "#FF0000",
      hasNote: false,
      noteId: null,
    };

    toast.promise(createHighlight(newHighlightDto).unwrap(), {
      pending: "Creating highlight...",
      success: "Highlight created",
      error: "Failed to create highlight",
    });
  };

  const handleAddNote = () => {
    const activeSelection = captureSelection();
    if (!activeSelection) return;
    toast.success("Note feature coming soon!");
  };

  const handleAddToSummary = async () => {
    const activeSelection = captureSelection();
    if (!activeSelection || !activeSelection.content.text) return;
    toast.success("Added to summary main points");
  };

  const handleCopy = async () => {
    const activeSelection = captureSelection();
    if (!activeSelection || !activeSelection.content.text) return;

    try {
      await navigator.clipboard.writeText(activeSelection.content.text);
      toast.success("Text copied to clipboard");
      highlighterUtilsRef.current?.removeGhostHighlight();
    } catch (error) {
      toast.error("Failed to copy text");
    }
  };

  return {
    // Selection state
    selection,
    setSelection,
    isTagDialogOpen,
    setIsTagDialogOpen,

    // AI state
    isExplainOpen,
    setIsExplainOpen,
    explainResult,

    // Handlers
    handleAddTag,
    handleTagConfirm,
    handleCreateHighlight,
    handleAddToSummary,
    handleAddNote,
    handleCopy,
    handleExplain,
  };
}
