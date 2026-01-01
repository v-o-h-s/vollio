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
import { JSONContent } from "@tiptap/core";

interface useSelectionProps {
  highlighterUtilsRef: React.RefObject<PdfHighlighterUtils | null>;
  document: DocumentDetails;
  currentHighlightColor?: string;
}

/**
 * Hook for managing text/area selections within the PDF viewer.
 * Provides handlers for common selection actions like highlighting, tagging, copying,
 * and AI-powered operations (Explain, Insight).
 */
export function useSelection({
  highlighterUtilsRef,
  document,
  currentHighlightColor,
}: useSelectionProps) {
  const { setIsVollAiOpen, addUserMessage, addSelectionToVollNotes } =
    useViewer();

  const [createHighlight] = useCreateHighlightMutation();
  const [selection, setSelection] = useState<any>(null);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);

  /**
   * Captures the current active selection from the PDF highlighter utility.
   * Syncs the local selection state and returns the raw selection data.
   */
  const getSelectionFromViewer = () => {
    const activeSelection = highlighterUtilsRef.current?.getCurrentSelection();
    if (activeSelection) {
      setSelection(activeSelection);
    }
    return activeSelection;
  };

  /**
   * Initiates the tagging process by capturing the current selection 
   * and opening the tag selection dialog.
   */
  const initiateTagging = () => {
    const activeSelection = getSelectionFromViewer();
    if (!activeSelection) return;
    setIsTagDialogOpen(true);
  };

  /**
   * Creates a standalone "Insight" style highlight for the selected text.
   * This highlight is marked as an insight but not linked to a full note.
   */
  const createInsightHighlight = async () => {
    const activeSelection = getSelectionFromViewer();
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
    } catch (error) {
      console.log(error);
    }
    setSelection(null);
  };

  /**
   * Triggers the AI assistant to explain the selected text.
   * Opens the AI panel and adds a document-referenced message to the chat history.
   */
  const askAiToExplainSelection = async () => {
    const activeSelection = getSelectionFromViewer();
    if (!activeSelection || !activeSelection.content?.text) return;
    setIsVollAiOpen(true);
    if (!activeSelection.content.text.trim()) return;

    const documentName = document.name;
    const content = activeSelection.content;
    const position = activeSelection.position;
    addUserMessage(`Explain the following: "${content.text}"`, {
      documentName,
      content: content,
      position,
    });
    setSelection(null);
  };

  /**
   * Callback executed when a selection interaction is completed in the viewer.
   * Automatically triggers the AI explanation if text was selected.
   */
  const handleSelectionComplete = (selection: any) => {
    setSelection(selection);
    if (selection && selection.content?.text) {
      askAiToExplainSelection();
    }
  };

  /**
   * Persists a "Tagged" style highlight to the database with the selected tags.
   */
  const finalizeTagging = async (selectedTags: string[]) => {
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

  /**
   * Creates a standard highlight with the currently active color and no tags/notes.
   */
  const createSimpleHighlight = async () => {
    const activeSelection = getSelectionFromViewer();
    if (!activeSelection) return;
    const highlightId = uuidv4();
    const newHighlightDto: CreateHighlightDTO = {
      id: highlightId,
      documentId: document.id,
      type: activeSelection.content.image ? "area" : "text",
      content: activeSelection.content,
      position: activeSelection.position,
      color: currentHighlightColor,
      hasNote: false,
      noteId: null,
      tags: [],
      style: "highlight",
    };
    try {
      await createHighlight(newHighlightDto).unwrap();
      setSelection(null);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Saves a rich-text V-Doc note associated with the current selection.
   * Creates a highlight with the "note" style and stores the HTML content.
   */
  const createRichTextVDocNote = async (noteContent: string) => {
    const activeSelection = getSelectionFromViewer();
    if (!activeSelection) return;
    const highlightId = uuidv4();
    const newHighlightDto: CreateHighlightDTO = {
      id: highlightId,
      documentId: document.id,
      type: activeSelection.content.image ? "area" : "text",
      content: activeSelection.content,
      position: activeSelection.position,
      color: currentHighlightColor,
      hasNote: false,
      noteId: null,
      noteContent: noteContent,
      tags: [],
      style: "note",
    };
    try {
      await createHighlight(newHighlightDto).unwrap();
      setSelection(null);
      highlighterUtilsRef.current?.removeGhostHighlight();
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Copies the selected text to the system clipboard.
   */
  const copySelectionToClipboard = async () => {
    const activeSelection = getSelectionFromViewer();
    if (!activeSelection || !activeSelection.content.text) return;

    try {
      await navigator.clipboard.writeText(activeSelection.content.text);
      highlighterUtilsRef.current?.removeGhostHighlight();
    } catch (error) {}
  };

  /**
   * Creates a "V-Note" (note-linked highlight) using the currently selected content.
   * Triggers the creation of a full note in the Voll-Notes panel.
   */
  const linkSelectionToNewVNote = async () => {
    const activeSelection = getSelectionFromViewer();
    if (!activeSelection) return;
    
    await addSelectionToVollNotes({
      documentName: document.name,
      content: activeSelection.content,
      position: activeSelection.position,
    });
  };

  return {
    // Selection state
    selection,
    setSelection,
    isTagDialogOpen,
    setIsTagDialogOpen,

    // Handlers
    initiateTagging,
    finalizeTagging,
    createSimpleHighlight,
    createRichTextVDocNote,
    copySelectionToClipboard,
    createInsightHighlight,
    askAiToExplainSelection,
    handleSelectionComplete,
    linkSelectionToNewVNote,
  };
}
