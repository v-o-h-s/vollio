"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useParams } from "next/navigation";
import { JSONContent } from "@tiptap/core";
import { v4 as uuidv4 } from "uuid";
import { Tab } from "../components/notes";
import { Note } from "@/lib/types/editor";
import { extractText } from "../utils";
import { useCreateHighlightMutation } from "@/lib/store/apiSlice";
import { CreateHighlightDTO, HighlightContent } from "@/lib/shared";

import { useViewerUI } from "../hooks/useViewerUI";
import { useVollNotesLogic, HOME_TAB_ID } from "../hooks/useVollNotesLogic";
import { useVollAiLogic, Message } from "../hooks/useVollAiLogic";
import { Highlight, ScaledPosition } from "react-pdf-highlighter-extended-plus";

import { ViewerComponents } from "../types/types";
import { TransformedRTKError } from "@/lib/utils/rtk-error-transform";

export { HOME_TAB_ID };
export type { Message };

/**
 * Defines the complete state and action set for the Document Viewer.
 * This context synchronizes the PDF viewer, AI assistant, and note-taking features.
 */
interface ViewerContextType {
  // --- UI State ---
  isVollAiOpen: boolean;
  setIsVollAiOpen: (isOpen: boolean) => void;
  toggleVollAi: () => void;
  isVollNotesOpen: boolean;
  setIsVollNotesOpen: (isOpen: boolean) => void;
  toggleVollNotes: () => void;
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  focusedComponent: ViewerComponents | null;
  setFocusedComponent: React.Dispatch<
    React.SetStateAction<ViewerComponents | null>
  >;

  // --- Voll-notes Actions & State ---
  tabs: Tab[];
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
  isRefreshing: boolean;
  deletingNoteId: string | null;
  createNewEmptyNote: (content?: JSONContent) => Promise<void>;
  closeNoteTab: (id: string) => void;
  permanentlyDeleteNote: (noteId: string) => Promise<void>;
  refreshDocumentNotes: () => Promise<void>;
  switchToActiveNoteTab: (tabId: string) => void;
  openNoteFromList: (noteId: string) => void;
  syncNoteTitleWithTab: (noteId: string, newTitle: string) => void;
  isLoadingNotes: boolean;
  notesError: any;
  documentNotes: Note[] | undefined;
  sortedNotes: Note[];
  isLoadingNewNote: boolean;
  createNoteError: any;
  refetchNotes: () => void;
  openNote: (noteId: string) => void;
  isGenerating: boolean;
  generateSummary: () => Promise<void>;
  resetSummary: () => void;
  summaryNote: Note | undefined;
  summaryError: TransformedRTKError | undefined;

  // --- Voll-ai State & Actions ---
  messages: Message[];
  addUserMessage: (
    message: string,
    metadata?: {
      documentName: string;
      content: HighlightContent;
      position: ScaledPosition;
    },
  ) => Promise<void>;
  handleDeleteMessage: (index: number) => void;
  resetMessages: () => void;
  isVollAiLoading: boolean;
  chatError: TransformedRTKError | undefined;

  // --- Shared Actions (Cross-component features) ---
  appendContentToActiveNote: (content: string | JSONContent) => Promise<void>;
  addInsightToVollNotes: (
    content: string | JSONContent,
    metadata?: {
      documentName: string;
      content: HighlightContent;
      position: ScaledPosition;
    },
  ) => Promise<void>;
  addSelectionToVollNotes: (
    metadata: {
      documentName: string;
      content: HighlightContent;
      position: ScaledPosition;
    },
    content?: JSONContent,
  ) => Promise<void>;
  copyContentToClipboard: (content: string | JSONContent) => Promise<void>;

  // --- Insight Navigation ---
  scrollToHighlight: (highlightId: string) => void;
  setHighlighterUtilsRef: (
    ref: React.RefObject<
      import("react-pdf-highlighter-extended-plus").PdfHighlighterUtils | null
    >,
  ) => void;
}

export const ViewerContext = createContext<ViewerContextType | undefined>(
  undefined,
);

/**
 * Provider component that wraps the document viewer, providing centralized
 * state management for AI chat, note-taking, and PDF interactions.
 */
export function ViewerProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const documentId = params?.id as string;

  // Manages panel visibility and focus state
  const ui = useViewerUI();

  // Manages note-taking logic (CRUD, tabs)
  const vollNotes = useVollNotesLogic(documentId);

  // Manages AI chat logic (history, API calls)
  const vollAi = useVollAiLogic();

  // Stores a reference to the PDF highlighter utility for programmatic scrolling/selections
  const [highlighterUtilsRef, setHighlighterUtilsRefState] =
    React.useState<React.RefObject<
      import("react-pdf-highlighter-extended-plus").PdfHighlighterUtils | null
    > | null>(null);

  /**
   * Sets the highlighter utility reference from the PDF viewer component.
   */
  const setHighlighterUtilsRef = React.useCallback(
    (
      ref: React.RefObject<
        import("react-pdf-highlighter-extended-plus").PdfHighlighterUtils | null
      >,
    ) => {
      setHighlighterUtilsRefState(ref);
    },
    [],
  );

  /**
   * Programmatically scrolls the PDF viewer to a specific highlight by its ID.
   */
  const scrollToHighlight = React.useCallback(
    (highlightId: string) => {
      if (!highlighterUtilsRef?.current) return;

      highlighterUtilsRef.current.scrollToHighlight({
        id: highlightId,
        position: {
          boundingRect: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            width: 0,
            height: 0,
            pageNumber: 1,
          },
          rects: [],
        },
      } as any);
    },
    [highlighterUtilsRef],
  );

  /**
   * Copies provided content (string or rich-text JSON) to the system clipboard.
   */
  const copyContentToClipboard = async (content: string | JSONContent) => {
    let textToCopy = "";
    if (typeof content === "string") {
      textToCopy = content;
    } else {
      textToCopy = extractText(content).trim();
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (err) {
      console.error("Failed to copy text: ", { ...(err as any) });
    }
  };

  /**
   * Appends plain text or rich-text content to the currently active note.
   * Automatically opens the notes panel if closed.
   */
  const appendContentToActiveNote = async (content: string | JSONContent) => {
    if (typeof content === "string") return;

    if (!ui.isVollNotesOpen) {
      ui.setIsVollNotesOpen(true);
    }

    try {
      await vollNotes.addContentAndLinkedHighlight(content);
    } catch (error) {
      // Error handled in addToNote
    }
  };

  /**
   * Creates a "V-Note" (note-linked highlight) and appends it to the active note.
   * Uses the "note" highlight style for visual distinction.
   */
  const addSelectionToVollNotes = async (
    metadata: {
      documentName: string;
      content: HighlightContent;
      position: ScaledPosition;
    },
    content?: JSONContent,
  ) => {
    if (!ui.isVollNotesOpen) {
      ui.setIsVollNotesOpen(true);
    }

    try {
      const HighlightNoteContent: JSONContent = {
        type: "doc",
        content: [
          {
            type: "note",
            attrs: {
              selectedText: metadata.content.text || "Note",
              metadata: {
                pageNumber: metadata.position.boundingRect.pageNumber,
              },
            },
            content: content?.content || [],
          },
        ],
      };
      await vollNotes.addContentAndLinkedHighlight(
        HighlightNoteContent,
        "vnote",
        {
          HighlightContent: metadata.content,
          HighlightPosition: metadata.position,
        },
      );
    } catch (error) {
      console.error("Failed to add note to notes:", error);
      throw error;
    }
  };

  /**
   * Wraps selected text in an "AI Insight" block and appends it to the active note.
   * Automatically creates a corresponding "insight" style highlight in the PDF.
   */
  const addInsightToVollNotes = async (
    content: string | JSONContent,
    metadata?: {
      documentName: string;
      content: HighlightContent;
      position: ScaledPosition;
    },
  ) => {
    if (typeof content === "string") return;

    if (!ui.isVollNotesOpen) {
      ui.setIsVollNotesOpen(true);
    }

    // Create the insight note
    try {
      // Wrap content in Insight node
      const insightContent: JSONContent = {
        type: "doc",
        content: [
          {
            type: "insight",
            attrs: {
              selectedText: metadata?.content?.text || "AI Insight",
              metadata: {
                pageNumber: metadata?.position.boundingRect.pageNumber,
              },
            },
            content: content.content || [],
          },
        ],
      };
      if (metadata) {
        await vollNotes.addContentAndLinkedHighlight(
          insightContent,
          "insight",
          {
            HighlightContent: metadata.content,
            HighlightPosition: metadata.position,
          },
        );
      }
    } catch (error: any) {
      console.error("Failed to add insight to notes:", error?.message || error);
      throw error;
    }
  };

  /**
   * Opens a specific note by ID, switching focus to its tab and ensuring the notes panel is open.
   */
  const openNote = (noteId: string) => {
    if (!ui.isVollNotesOpen) {
      ui.setIsVollNotesOpen(true);
    }
    vollNotes.openNote(noteId);
  };

  return (
    <ViewerContext.Provider
      value={{
        // UI State
        ...ui,

        // Voll-notes State
        ...vollNotes,

        // Voll-ai State
        ...vollAi,

        // Shared Actions
        appendContentToActiveNote,
        addInsightToVollNotes,
        addSelectionToVollNotes,
        copyContentToClipboard,

        // Navigation
        scrollToHighlight,
        setHighlighterUtilsRef,

        // Action Overrides
        openNote,
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
}

/**
 * Custom hook to access the ViewerContext.
 * Must be used within a ViewerProvider.
 */
export function useViewer() {
  const context = useContext(ViewerContext);
  if (context === undefined) {
    throw new Error("useViewer must be used within a ViewerProvider");
  }
  return context;
}
