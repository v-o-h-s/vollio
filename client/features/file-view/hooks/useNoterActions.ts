import { useGetNotesQuery } from "@/lib/store/apiSlice";
import { FileDetails } from "../types/document";
import { useMemo, useState, useCallback } from "react";
import {
  useDeleteNoteMutation,
  useCreateNoteMutation,
} from "@/lib/store/apiSlice";
import { Tab } from "../components/notes";
import { useViewer } from "../context/ViewerContext";
export const HOME_TAB_ID = "home";
export function useNoterActions(file: FileDetails) {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: HOME_TAB_ID, label: "Home", isHome: true },
  ]);
  const { activeTabId, setActiveTabId } = useViewer();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  //rtk queries
  const {
    data: fileNotes,
    isLoading,
    error,
    refetch,
  } = useGetNotesQuery({ pdfId: file.id });
  const [deleteNote] = useDeleteNoteMutation();
  const [createNote, { error: createNoteError, isLoading: isLoadingNewNote }] =
    useCreateNoteMutation();

  // Sort notes by most recently updated
  const sortedNotes = useMemo(() => {
    if (!fileNotes) return [];
    return [...fileNotes].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [fileNotes]);

  const handleCreateNote = async () => {
    if (isLoadingNewNote) return;
    try {
      const newNote = await createNote({
        pdfId: file.id,
        title: "Untitled note",
      }).unwrap();

      const newTab: Tab = {
        id: newNote.id,
        label: newNote.title,
      };
      setTabs((prev) => [...prev, newTab]);
      setActiveTabId(newNote.id);
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const handleDeleteTab = (id: string) => {
    // If we're deleting the active tab, find the next tab to activate
    if (activeTabId === id) {
      const currentIndex = tabs.findIndex((tab) => tab.id === id);

      // Try to activate the previous tab first, then next, then home
      let newActiveTabId = HOME_TAB_ID;

      if (currentIndex > 0) {
        // Activate the tab before this one
        newActiveTabId = tabs[currentIndex - 1].id;
      } else if (currentIndex < tabs.length - 1) {
        // If this is the first tab, activate the next one
        newActiveTabId = tabs[currentIndex + 1].id;
      }

      setActiveTabId(newActiveTabId);
    }

    // Remove the tab
    setTabs((prev) => prev.filter((tab) => tab.id !== id));
  };

  const handleDeleteNote = async (noteId: string) => {
    setDeletingNoteId(noteId);
    try {
      await deleteNote(noteId).unwrap();
      // Also close the tab if it's open
      setTabs((prev) => prev.filter((tab) => tab.id !== noteId));
      if (activeTabId === noteId) {
        setActiveTabId(HOME_TAB_ID);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleTabClick = (tabId: string) => {
    console.log("Tab clicked:", tabId);
    setActiveTabId(tabId);
  };

  const handleNoteCardClick = (noteId: string) => {
    // Check if tab already exists for this note
    const existingTab = tabs.find((tab) => tab.id === noteId);
    if (existingTab) {
      setActiveTabId(noteId);
      return;
    }

    // Find the note to get its title
    const note = fileNotes?.find((n) => n.id === noteId);
    if (!note) return;

    // Create a new tab for this note
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

  return {
    tabs,
    activeTabId,
    isRefreshing,
    deletingNoteId,
    handleCreateNote,
    handleDeleteTab,
    handleDeleteNote,
    handleRefresh,
    handleTabClick,
    handleNoteCardClick,
    handleTitleChange,
    isLoading,
    error,
    fileNotes,
    sortedNotes,
    isLoadingNewNote,
    createNoteError,
    refetch,
    setTabs,
  };
}
