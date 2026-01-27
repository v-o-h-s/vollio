"use client";

import { useState, useMemo, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { JSONContent } from "@tiptap/core";
import { useAppDispatch } from "@/lib/store/hooks";
import { setShouldReadFromProps } from "@/lib/store/slices/editorSlice";
import {
  useGetNotesQuery,
  useDeleteNoteMutation,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useGetNoteQuery,
  useCreateHighlightMutation,
  useGenerateSummaryMutation,
} from "@/lib/store/apiSlice";
import { Tab } from "../components/notes";
import { CreateHighlightDTO } from "@vollio/shared";
import { ScaledPosition } from "react-pdf-highlighter-extended-plus";
import { HighlightContent } from "@vollio/shared";
export const HOME_TAB_ID = "home";

/**
 * Manages the logic for notes within the document viewer, including CRUD operations,
 * tab management, and linking highlights to specific notes.
 */
export function useVollNotesLogic(documentId: string) {
  const dispatch = useAppDispatch();
  const [tabs, setTabs] = useState<Tab[]>([
    { id: HOME_TAB_ID, label: "Home", isHome: true },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(HOME_TAB_ID);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // Fetches all notes associated with the current document
  const {
    data: documentNotes,
    isLoading: isLoadingNotes,
    error: notesError,
    refetch: refetchNotes,
  } = useGetNotesQuery({ documentId }, { skip: !documentId });

  // API mutations for managing notes and highlights
  const [deleteNote] = useDeleteNoteMutation();
  const [createNote, { error: createNoteError, isLoading: isLoadingNewNote }] =
    useCreateNoteMutation();
  const [updateNote] = useUpdateNoteMutation();
  const [createHighlight] = useCreateHighlightMutation();
  const [generateSummaryMutation, { isLoading: isGenerating }] =
    useGenerateSummaryMutation();

  // Fetches the full content of the currently active note (if any)
  const { data: currentNote, refetch: refetchCurrentNote } = useGetNoteQuery(
    activeTabId,
    {
      skip: activeTabId === HOME_TAB_ID,
    }
  );

  /**
   * Provides a list of document notes sorted by their last updated timestamp.
   */
  const sortedNotes = useMemo(() => {
    if (!documentNotes) return [];
    return [...documentNotes].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [documentNotes]);

  /**
   * function to register the sumamry note
   */
  const summaryNote = useMemo(() => {
    return documentNotes?.find((n) => n.isSummary);
  }, [documentNotes]);

  /**
   * function to generate summary for document
   */
  const generateSummary = async () => {
    try {
      await generateSummaryMutation(documentId).unwrap();
    } catch (error) {
      console.error("Failed to generate summary:", error);
      toast.error("Failed to generate summary");
    }
  };

  /**
   * Creates a new blank note for the document and opens it in a new tab.
   */
  const createNewEmptyNote = async (
    content?: JSONContent,
    highlight?: {
      HighlightContent: string;
      HighlightPosition: number;
    }
  ) => {
    if (isLoadingNewNote || !documentId) return;

    try {
      const newNote = await createNote({
        documentId: documentId,
        title: "Untitled note",
        content: content,
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

  /**
   * Closes a specific tab and automatically switches focus to an adjacent tab
   * or the Home screen.
   */
  const closeNoteTab = (id: string) => {
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

  /**
   * Permanently deletes a note from the database and removes its tab if open.
   */
  const permanentlyDeleteNote = async (noteId: string) => {
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

  /**
   * Triggers a manual refresh of the document's notes list.
   */
  const refreshDocumentNotes = async () => {
    setIsRefreshing(true);
    await refetchNotes();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  /**
   * Switches the active focus to the specified tab.
   */
  const switchToActiveNoteTab = (tabId: string) => {
    setActiveTabId(tabId);
  };

  /**
   * Handles clicking on a note card in the Home list, opening it in a tab
   * or switching to it if already open.
   */
  const openNoteFromList = (noteId: string) => {
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

  /**
   * Syncs the tab label with the note's title when it is updated.
   */
  const syncNoteTitleWithTab = useCallback(
    (noteId: string, newTitle: string) => {
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === noteId ? { ...tab, label: newTitle } : tab
        )
      );
    },
    []
  );

  /**
   * Adds rich-text content to the current note or creates a new one if on Home.
   * Optionally creates a linked PDF highlight (Insight or Note style).
   */
  const addContentAndLinkedHighlight = async (
    content: string | JSONContent,
    highlightStyle: "insight" | "note" | "vdoc" | "vnote" = "insight",
    Highlight?: {
      HighlightContent: HighlightContent;
      HighlightPosition: ScaledPosition;
    }
  ) => {
    if (typeof content === "string") return;

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
        if (Highlight) {
          const highlight: CreateHighlightDTO = {
            id: uuidv4(),
            noteId: activeTabId,
            documentId: documentId,
            type: "text",
            content: Highlight.HighlightContent,
            position: Highlight.HighlightPosition,
            style: highlightStyle,
          };
          try {
            await createHighlight(highlight).unwrap();
          } catch (error) {
            console.error("Failed to create highlight:", { ...(error as any) });
            toast.error("Failed to create highlight");
          }
        }
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

        const newTab: Tab = {
          id: noteId,
          label: "Created from Assistant",
        };
        setTabs((prev) => [...prev, newTab]);
        // set the targetNote to the new note
        dispatch(setShouldReadFromProps(true));

        setActiveTabId(noteId);
        if (Highlight) {
          const highlight: CreateHighlightDTO = {
            id: uuidv4(),
            noteId: noteId,
            documentId: documentId,
            type: "text",
            content: Highlight.HighlightContent,
            position: Highlight.HighlightPosition,
            style: highlightStyle,
          };
          try {
            await createHighlight(highlight).unwrap();
          } catch (error) {
            console.error("Failed to create highlight:", { ...(error as any) });
            toast.error("Failed to create highlight");
          }
        }
      }
    } catch (error) {
      console.error("Failed to add to notes:", { ...(error as any) });
      toast.error("Failed to add to notes");
      throw error;
    }
  };

  /**
   * Helper function to open a specific note by ID and switch to its tab.
   */
  const openNote = (noteId: string) => {
    openNoteFromList(noteId);
  };

  return {
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    isRefreshing,
    deletingNoteId,
    documentNotes,
    sortedNotes,
    isLoadingNotes,
    notesError,
    isLoadingNewNote,
    createNoteError,
    refetchNotes,
    createNewEmptyNote,
    closeNoteTab,
    permanentlyDeleteNote,
    refreshDocumentNotes,
    switchToActiveNoteTab,
    openNoteFromList,
    syncNoteTitleWithTab,
    addContentAndLinkedHighlight,
    openNote,
    summaryNote,
    generateSummary,
    isGenerating,
  };
}
