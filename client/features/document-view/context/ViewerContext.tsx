"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useParams } from "next/navigation";
import { JSONContent } from "@tiptap/core";
import { v4 as uuidv4 } from "uuid";
import { Tab } from "../components/notes";
import { Note } from "@/lib/types/editor";
import { extractText } from "../utils";
import { useCreateHighlightMutation } from "@/lib/store/apiSlice";
import { CreateHighlightDTO, HighlightContent } from "@vollio/shared";

import { useViewerUI } from "../hooks/useViewerUI";
import { useVollNotesLogic, HOME_TAB_ID } from "../hooks/useVollNotesLogic";
import { useVollAiLogic, Message } from "../hooks/useVollAiLogic";
import { Highlight, ScaledPosition } from "react-pdf-highlighter-extended-plus";

export { HOME_TAB_ID };
export type { Message };

interface ViewerContextType {
  // UI State
  isVollAiOpen: boolean;
  setIsVollAiOpen: (isOpen: boolean) => void;
  toggleVollAi: () => void;
  isVollNotesOpen: boolean;
  setIsVollNotesOpen: (isOpen: boolean) => void;
  toggleVollNotes: () => void;
  activeTabId: string;
  setActiveTabId: (id: string) => void;
  focusedComponent: "v-ai" | "v-notes" | "v-doc" | null;
  setFocusedComponent: (component: "v-ai" | "v-notes" | "v-doc" | null) => void;

  // Voll-notes Actions & State
  tabs: Tab[];
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>;
  isRefreshing: boolean;
  deletingNoteId: string | null;
  handleCreateNote: (content?: JSONContent) => Promise<void>;
  handleDeleteTab: (id: string) => void;
  handleDeleteNote: (noteId: string) => Promise<void>;
  handleRefresh: () => Promise<void>;
  handleTabClick: (tabId: string) => void;
  handleNoteCardClick: (noteId: string) => void;
  handleTitleChange: (noteId: string, newTitle: string) => void;
  isLoadingNotes: boolean;
  notesError: any;
  documentNotes: Note[] | undefined;
  sortedNotes: Note[];
  isLoadingNewNote: boolean;
  createNoteError: any;
  refetchNotes: () => void;
  openNote: (noteId: string) => void;

  // Voll-ai State & Actions
  messages: Message[];
  addUserMessage: (
    message: string,
    metadata?: {
      documentName: string;
      content: HighlightContent;
      position: ScaledPosition;
    }
  ) => Promise<void>;
  handleDeleteMessage: (index: number) => void;
  resetMessages: () => void;
  isVollAiLoading: boolean;

  // Shared Actions (Voll-ai Actions)
  handleAddToNotes: (content: string | JSONContent) => Promise<void>;
  handleAddToNoteAsInsight: (
    content: string | JSONContent,
    metadata?: {
      documentName: string;
      content: HighlightContent;
      position: ScaledPosition;
    }
  ) => Promise<void>;
  handleCopy: (content: string | JSONContent) => Promise<void>;

  // Insight Navigation
  scrollToHighlight: (highlightId: string) => void;
  setHighlighterUtilsRef: (
    ref: React.RefObject<
      import("react-pdf-highlighter-extended-plus").PdfHighlighterUtils | null
    >
  ) => void;
}

const ViewerContext = createContext<ViewerContextType | undefined>(undefined);

export function ViewerProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const documentId = params?.id as string;

  // --- UI State ---
  const ui = useViewerUI();

  // --- Voll-notes State & Logic ---
  const vollNotes = useVollNotesLogic(documentId);

  // --- Voll-ai State & Logic ---
  const vollAi = useVollAiLogic();

  // --- Highlighter Ref for PDF navigation ---
  const [highlighterUtilsRef, setHighlighterUtilsRefState] =
    React.useState<React.RefObject<
      import("react-pdf-highlighter-extended-plus").PdfHighlighterUtils | null
    > | null>(null);

  const setHighlighterUtilsRef = React.useCallback(
    (
      ref: React.RefObject<
        import("react-pdf-highlighter-extended-plus").PdfHighlighterUtils | null
      >
    ) => {
      setHighlighterUtilsRefState(ref);
    },
    []
  );

  const scrollToHighlight = React.useCallback(
    (highlightId: string) => {
      if (!highlighterUtilsRef?.current) return;

      const highlights =
        highlighterUtilsRef.current.getViewer()?.findController;
      // For now, we'll use scrollToHighlight with a mock highlight object
      // This will be called by the Insight component with the actual highlight data
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
    [highlighterUtilsRef]
  );

  // --- Shared Actions ---

  const handleCopy = async (content: string | JSONContent) => {
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

  const handleAddToNotes = async (content: string | JSONContent) => {
    if (typeof content === "string") return;

    if (!ui.isVollNotesOpen) {
      ui.setIsVollNotesOpen(true);
    }

    try {
      await vollNotes.addToNote(content);
    } catch (error) {
      // Error handled in addToNote
    }
  };

  const handleAddToNoteAsInsight = async (
    content: string | JSONContent,
    metadata?: {
      documentName: string;
      content: HighlightContent;
      position: ScaledPosition;
    }
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
        await vollNotes.addToNote(insightContent, {
          HighlightContent: metadata.content,
          HighlightPosition: metadata.position,
        });
      }
    } catch (error: any) {
      console.error("Failed to add insight to notes:", error?.message || error);
      throw error;
    }
  };

  const openNote = (noteId: string) => {
    if (!ui.isVollNotesOpen) {
      ui.setIsVollNotesOpen(true);
    }
    vollNotes.openNote(noteId);
  };

  return (
    <ViewerContext.Provider
      value={{
        // UI
        ...ui,

        // Voll-notes
        ...vollNotes,

        // Voll-ai
        ...vollAi,

        // Actions
        handleAddToNotes,
        handleAddToNoteAsInsight,
        handleCopy,

        // Navigation
        scrollToHighlight,
        setHighlighterUtilsRef,
        
        // Overrides
        openNote,
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
}

export function useViewer() {
  const context = useContext(ViewerContext);
  if (context === undefined) {
    throw new Error("useViewer must be used within a ViewerProvider");
  }
  return context;
}
