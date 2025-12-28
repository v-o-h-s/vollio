/**
 * ViewerContext manages the visibility and state of auxiliary panels within the document viewer,
 * specifically the AI Assistant and the Noter tool.
 * It also consolidates the logic for managing notes (Noter) and Assistant messages.
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
  use,
} from "react";
import { useParams } from "next/navigation";
import {
  useGetNotesQuery,
  useDeleteNoteMutation,
  useCreateNoteMutation,
  useAssistantChatMutation,
  useUpdateNoteMutation,
  useGetNoteQuery,
} from "@/lib/store/apiSlice";
import { Tab } from "../components/notes";
import { JSONContent } from "@tiptap/core";
import { AssistantChatMessage } from "@vollio/shared";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setShouldReadFromProps } from "@/lib/store/slices/editorSlice";
import { extractText } from "../utils";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import { Note } from "@/lib/types/editor";

export const HOME_TAB_ID = "home";

interface Message {
  role: "user" | "assistant";
  content: string | JSONContent;
  timestamp: Date;
}

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
  addUserMessage: (message: string) => Promise<void>;
  handleDeleteMessage: (index: number) => void;
  resetMessages: () => void;
  isAssistantLoading: boolean;

  // Shared Actions (Assistant Actions)
  handleAddToNotes: (content: string | JSONContent) => Promise<void>;
  handleAddToNoteAsInsight: (content: string | JSONContent) => Promise<void>;
  handleCopy: (content: string | JSONContent) => Promise<void>;
}

const ViewerContext = createContext<ViewerContextType | undefined>(undefined);

export function ViewerProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const documentId = params?.id as string;
  const dispatch = useAppDispatch();

  // --- UI State ---
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isNoterOpen, setIsNoterOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string>(HOME_TAB_ID);

  const toggleAssistant = () => setIsAssistantOpen((prev) => !prev);
  const toggleNoter = () => setIsNoterOpen((prev) => !prev);

  // --- Noter State & Logic ---
  const [tabs, setTabs] = useState<Tab[]>([
    { id: HOME_TAB_ID, label: "Home", isHome: true },
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // RTK Queries for Notes
  const {
    data: documentNotes,
    isLoading: isLoadingNotes,
    error: notesError,
    refetch: refetchNotes,
  } = useGetNotesQuery({ documentId }, { skip: !documentId });

  const [deleteNote] = useDeleteNoteMutation();
  const [createNote, { error: createNoteError, isLoading: isLoadingNewNote }] =
    useCreateNoteMutation();
  const [updateNote] = useUpdateNoteMutation();

  // For handleAddToNotes: we need the current note if we are appending
  const { data: currentNote, refetch: refetchCurrentNote } = useGetNoteQuery(
    activeTabId,
    {
      skip: activeTabId === HOME_TAB_ID,
    }
  );

  // Sort notes
  const sortedNotes = useMemo(() => {
    if (!documentNotes) return [];
    return [...documentNotes].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [documentNotes]);

  const handleCreateNote = async (content?: JSONContent) => {
    if (isLoadingNewNote || !documentId) return;
    try {
      const newNote = await createNote({
        documentId: documentId,
        title: "Untitled note",
        content: content ?? null,
      }).unwrap();

      const newTab: Tab = {
        id: newNote.id,
        label: newNote.title,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newNote.id);
    } catch (error) {
      console.error("Failed to create note:", { ...(error as any) });
      toast.error("Failed to create note");
    }
  };

  const handleDeleteTab = (id: string) => {
    if (activeTabId === id) {
      const currentIndex = tabs.findIndex((tab) => tab.id === id);
      let newActiveTabId = HOME_TAB_ID;

      if (currentIndex > 0) {
        newActiveTabId = tabs[currentIndex - 1].id;
      } else if (currentIndex < tabs.length - 1) {
        newActiveTabId = tabs[currentIndex + 1].id;
      }

      setActiveTabId(newActiveTabId);
    }
    setTabs((prev) => prev.filter((tab) => tab.id !== id));
  };

  const handleDeleteNote = async (noteId: string) => {
    setDeletingNoteId(noteId);
    try {
      await deleteNote(noteId).unwrap();
      setTabs((prev) => prev.filter((tab) => tab.id !== noteId));
      if (activeTabId === noteId) {
        setActiveTabId(HOME_TAB_ID);
      }
    } catch (error) {
      console.error("Failed to delete note:", { ...(error as any) });
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchNotes();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleNoteCardClick = (noteId: string) => {
    const existingTab = tabs.find((tab) => tab.id === noteId);
    if (existingTab) {
      setActiveTabId(noteId);
      return;
    }

    const note = documentNotes?.find((n) => n.id === noteId);
    if (!note) return;

    const newTab: Tab = {
      id: noteId,
      label: note.title || "Untitled",
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(noteId);
  };

  const handleTitleChange = useCallback((noteId: string, newTitle: string) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === noteId ? { ...tab, label: newTitle } : tab
      )
    );
  }, []);

  // --- Assistant State & Logic ---
  const [messages, setMessages] = useState<Message[]>([]);
  const { aiAssistantModel, aiAssistantTone } = useAppSelector(
    (state) => state.settings
  );
  const [assistantChat, { isLoading: isAssistantLoading }] =
    useAssistantChatMutation();

  const extractTextFromContent = (content: string | JSONContent): string => {
    if (typeof content === "string") return content;
    if (!content.content) return "";
    return content.content
      .map((node) => {
        if (node.type === "text") return node.text;
        if (node.content) return extractTextFromContent(node);
        return "";
      })
      .join(" ");
  };

  const addUserMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMsg: Message = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const history: AssistantChatMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: extractTextFromContent(msg.content),
      }));

      const response = await assistantChat({
        message,
        history,
        model: aiAssistantModel,
        tone: aiAssistantTone,
      } as any).unwrap();

      const assistantMsg: Message = {
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Failed to get assistant response:", { ...(error as any) });
      const errorMsg: Message = {
        role: "assistant",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Sorry, I encountered an error while processing your request.",
                },
              ],
            },
          ],
        },
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleDeleteMessage = (index: number) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      if (newMessages[index].role === "assistant" && index > 0) {
        newMessages.splice(index - 1, 2);
      } else {
        newMessages.splice(index, 1);
      }
      return newMessages;
    });
  };

  const resetMessages = () => {
    setMessages([]);
  };

  // --- Shared Actions (Assistant Actions) ---

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
      toast.error("Failed to copy text");
    }
  };

  const handleAddToNotes = async (content: string | JSONContent) => {
    if (typeof content === "string") {
      return;
    }

    if (!isNoterOpen) {
      setIsNoterOpen(true);
    }

    try {
      if (activeTabId !== HOME_TAB_ID) {
        // Append to existing note
        if (!currentNote) return;

        const newContent = {
          type: "doc",
          content: [
            ...(currentNote.content?.content || []),
            ...(content.content || []),
          ],
        };
        await updateNote({
          id: activeTabId,
          updates: {
            content: newContent,
          },
        }).unwrap();
        await refetchCurrentNote();
        dispatch(setShouldReadFromProps(true));
        toast.success("Added to existing note");
      } else {
        // Create new note
        const noteId = uuidv4();
        await createNote({
          id: noteId,
          documentId: documentId,
          content: content,
          color: "#ffffff",
          is_auto_generated: false,
        }).unwrap();

        // We also need to add the tab for this new note here,
        // similar to how handleCreateNote does it, but we have the noteId already.
        // Wait, createNote returns the note object.
        // But here we generated uuidv4 manually passing it to createNote.
        // The previous implementation used manually generated ID.

        const newTab: Tab = {
          id: noteId,
          label: "Created from Assistant", // Or fetch the title if possible, or just default.
        };
        setTabs((prev) => [...prev, newTab]);

        dispatch(setShouldReadFromProps(true));
        toast.success("Created new note with content");
        setActiveTabId(noteId);
      }
    } catch (error) {
      console.error("Failed to add to notes:", { ...(error as any) });
      toast.error("Failed to add to notes");
    }
  };
  
  return (
    <ViewerContext.Provider
      value={{
        // UI
        isAssistantOpen,
        setIsAssistantOpen,
        toggleAssistant,
        isNoterOpen,
        setIsNoterOpen,
        toggleNoter,
        activeTabId,
        setActiveTabId,

        // Noter
        tabs,
        setTabs,
        isRefreshing,
        deletingNoteId,
        handleCreateNote,
        handleDeleteTab,
        handleDeleteNote,
        handleRefresh,
        handleTabClick,
        handleNoteCardClick,
        handleTitleChange,
        isLoadingNotes,
        notesError,
        documentNotes,
        sortedNotes,
        isLoadingNewNote,
        createNoteError,
        refetchNotes,

        // Assistant
        messages,
        addUserMessage,
        handleDeleteMessage,
        resetMessages,
        isAssistantLoading,

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
