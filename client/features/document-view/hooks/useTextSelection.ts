import {
  useUpdateHighlightMutation,
  useCreateHighlightMutation,
  useLazyExplainTextQuery,
} from "@/lib/store/apiSlice";
import { useState } from "react";
import { PdfHighlighterUtils } from "react-pdf-highlighter-extended-plus";
import { v4 as uuidv4 } from "uuid";
import { DocumentDetails } from "@/features/document-view/types/document";
import { useViewer } from "../context/ViewerContext";
import { CreateHighlightDTO } from "@vollio/shared";
import { toast } from "react-toastify";
interface useSelectionProps {
  highlighterUtilsRef: React.RefObject<PdfHighlighterUtils | null>;
  document: DocumentDetails;
  currentHighlightColor?: string;
}

export function useSelection({
  highlighterUtilsRef,
  document,
  currentHighlightColor,
}: useSelectionProps) {
  const { setIsAssistantOpen, addUserMessage } = useViewer();

  const [createHighlight] = useCreateHighlightMutation();
  const [selection, setSelection] = useState<any>(null);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);

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

  // handle to add insight to selected text
  const handleAddInsight = async () => {
    const activeSelection = captureSelection();
    if (!activeSelection) return;
    const highlight: CreateHighlightDTO = {
      id: uuidv4(),
      documentId: document.id,
      type: "text",
      content: activeSelection.content,
      position: activeSelection.position,
      style: "insight",
    };
    try {
      await createHighlight(highlight).unwrap();
      toast.success("Insight added successfully");
    } catch (error) {
      console.log(error);
    }
    setSelection(null);
  };

  const handleExplain = async () => {
    const activeSelection = captureSelection();
    if (!activeSelection || !activeSelection.content?.text) return;
    setIsAssistantOpen(true);
    if (!activeSelection.content.text.trim()) return;

    const documentName = document.name;
    const content = activeSelection.content;
    const position = activeSelection.position;
    addUserMessage(`Explain the following: "${content.text}"`, {
      documentName,
      content: content.text || "",
      position,
    });
    setSelection(null);
  };

  const onSelectionFinished = (selection: any) => {
    setSelection(selection);
    if (selection && selection.content?.text) {
      handleExplain();
    }
  };

  const handleTagConfirm = async (selectedTags: string[]) => {
    if (!selection) return;

    try {
      const highlightId = uuidv4();
      const newHighlightDto: CreateHighlightDTO = {
        id: highlightId,
        documentId: document.id,
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
      setSelection(null);
    } catch (error) {}
  };

  const handleCreateHighlight = async () => {
    const activeSelection = captureSelection();
    if (!activeSelection) return;
  };

  const handleAddNote = () => {
    const activeSelection = captureSelection();
    if (!activeSelection) return;
  };

  const handleCopy = async () => {
    const activeSelection = captureSelection();
    if (!activeSelection || !activeSelection.content.text) return;

    try {
      await navigator.clipboard.writeText(activeSelection.content.text);
      highlighterUtilsRef.current?.removeGhostHighlight();
    } catch (error) {}
  };

  return {
    // Selection state
    selection,
    setSelection,
    isTagDialogOpen,
    setIsTagDialogOpen,

    // Handlers
    handleAddTag,
    handleTagConfirm,
    handleCreateHighlight,
    handleAddNote,
    handleCopy,
    handleAddInsight,
    handleExplain,
    onSelectionFinished,
  };
}
