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
} from "@/lib/store/apiSlice";
import { Tab } from "../components/notes";
import { Note } from "@/lib/types/editor";

export const HOME_TAB_ID = "home";

export function useNoterLogic(documentId: string) {
  const dispatch = useAppDispatch();
  const [tabs, setTabs] = useState<Tab[]>([
    { id: HOME_TAB_ID, label: "Home", isHome: true },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(HOME_TAB_ID);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  // RTK Queries
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

  const { data: currentNote, refetch: refetchCurrentNote } = useGetNoteQuery(
    activeTabId,
    {
      skip: activeTabId === HOME_TAB_ID,
    }
  );

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

  const addToNote = async (content: string | JSONContent) => {
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

        dispatch(setShouldReadFromProps(true));
        toast.success("Created new note with content");
        setActiveTabId(noteId);
      }
      
    } catch (error) {
      console.error("Failed to add to notes:", { ...(error as any) });
      toast.error("Failed to add to notes");
      throw error;
    }
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
    handleCreateNote,
    handleDeleteTab,
    handleDeleteNote,
    handleRefresh,
    handleTabClick,
    handleNoteCardClick,
    handleTitleChange,
    addToNote,
  };
}
