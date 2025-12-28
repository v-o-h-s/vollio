"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useParams } from "next/navigation";
import { JSONContent } from "@tiptap/core";
import { toast } from "react-toastify";
import { Tab } from "../components/notes";
import { Note } from "@/lib/types/editor";
import { extractText } from "../utils";

import { useViewerUI } from "../hooks/useViewerUI";
import { useNoterLogic, HOME_TAB_ID } from "../hooks/useNoterLogic";
import { useAssistantLogic, Message } from "../hooks/useAssistantLogic";

export { HOME_TAB_ID };
export type { Message };

interface ViewerContextType {
  // UI State
  isAssistantOpen: boolean;
  setIsAssistantOpen: (isOpen: boolean) => void;
  toggleAssistant: () => void;
  isNoterOpen: boolean;
  setIsNoterOpen: (isOpen: boolean) => void;
  toggleNoter: () => void;
  activeTabId: string;
  setActiveTabId: (id: string) => void;

  // Noter Actions & State
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

  // Assistant State & Actions
  messages: Message[];
  addUserMessage: (
    message: string,
    metadata?: {
      documentName: string;
      pageNumber: number;
      selectedText?: string;
    }
  ) => Promise<void>;
  handleDeleteMessage: (index: number) => void;
  resetMessages: () => void;
  isAssistantLoading: boolean;

  // Shared Actions (Assistant Actions)
  handleAddToNotes: (content: string | JSONContent) => Promise<void>;
  handleAddToNoteAsInsight: (
    content: string | JSONContent,
    metadata?: {
      documentName: string;
      pageNumber: number;
      selectedText?: string;
    }
  ) => Promise<void>;
  handleCopy: (content: string | JSONContent) => Promise<void>;
}

const ViewerContext = createContext<ViewerContextType | undefined>(undefined);

export function ViewerProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const documentId = params?.id as string;

  // --- UI State ---
  const ui = useViewerUI();

  // --- Noter State & Logic ---
  const noter = useNoterLogic(documentId);

  // --- Assistant State & Logic ---
  const assistant = useAssistantLogic();

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
      toast.success("Copied to clipboard");
    } catch (err) {
      console.error("Failed to copy text: ", { ...(err as any) });
      toast.error("Failed to copy text");
    }
  };

  const handleAddToNotes = async (content: string | JSONContent) => {
    if (typeof content === "string") return;

    if (!ui.isNoterOpen) {
      ui.setIsNoterOpen(true);
    }

    try {
      await noter.addToNote(content);
    } catch (error) {
      // Error handled in addToNote
    }
  };

  const handleAddToNoteAsInsight = async (
    content: string | JSONContent,
    metadata?: {
      documentName: string;
      pageNumber: number;
      selectedText?: string;
    }
  ) => {
    if (typeof content === "string") return;

    if (!ui.isNoterOpen) {
      ui.setIsNoterOpen(true);
    }

    try {
      // Wrap content in Insight node
      const insightContent: JSONContent = {
        type: "doc",
        content: [
          {
            type: "insight",
            attrs: {
              selectedText: metadata?.selectedText || "AI Insight",
              metadata: {
                documentName: metadata?.documentName || "Assistant",
                pageNumber: metadata?.pageNumber || 1,
                createdAt: new Date().toISOString(),
              },
            },
            content: content.content || [],
          },
        ],
      };

      await noter.addToNote(insightContent);
    } catch (error) {
      // Error handled in addToNote
    }
  };

  return (
    <ViewerContext.Provider
      value={{
        // UI
        ...ui,

        // Noter
        ...noter,

        // Assistant
        ...assistant,

        // Actions
        handleAddToNotes,
        handleAddToNoteAsInsight,
        handleCopy,
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
