import { PDFDocument } from "@/lib/types/pdf";
import NotesTabsManager, { Tab } from "./NotesTabsManager";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Home, RefreshCw } from "lucide-react";
import {
  useGetNotesQuery,
  useGetNoteQuery,
  useDeleteNoteMutation,
  useCreateNoteMutation,
} from "@/lib/store/apiSlice";
import { LoadingState } from "@/components/ui/loading";
import { NotionEditor } from "@/components/editor";
import { NoteCard } from "./NoteCard";
import { NoteContent } from "@/lib/types/editor";

const HOME_TAB_ID = "home";

export default function Noter({ pdfDocument }: { pdfDocument: PDFDocument }) {
  // states
  const [tabs, setTabs] = useState<Tab[]>([
    { id: HOME_TAB_ID, label: "Home", isHome: true },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>(HOME_TAB_ID);
  const [isRefreshing, setIsRefreshing] = useState(false);

  //rtk queries
  const {
    data: fileNotes,
    isLoading,
    error,
    refetch,
  } = useGetNotesQuery({ pdfId: pdfDocument.id });
  const [deleteNote, { isLoading: isLoadingDeleteNote }] =
    useDeleteNoteMutation();
  const [createNote, { error: createNoteError, isLoading: isLoadingNewNote }] =
    useCreateNoteMutation();
  // this line will run every time the activeTabId changes
  const {
    data: activeNoteContent,
    error: getNoteError,
    isLoading: isLoadingNote,
  } = useGetNoteQuery(activeTabId, { skip: activeTabId === HOME_TAB_ID });

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
        pdfId: pdfDocument.id,
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
    setTabs((prev) => prev.filter((tab) => tab.id !== id));
    // If we deleted the active tab, switch to home
    if (activeTabId === id) {
      setActiveTabId(HOME_TAB_ID);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId).unwrap();
      // Also close the tab if it's open
      setTabs((prev) => prev.filter((tab) => tab.id !== noteId));
      if (activeTabId === noteId) {
        setActiveTabId(HOME_TAB_ID);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleTabClick = (tabId: string) => {
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

  const handleNoteCreated = (noteId: string) => {
    // When a new note is created, update the tab ID
    const currentTab = tabs.find((t) => t.id === activeTabId);
    if (currentTab && !currentTab.isHome) {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === activeTabId ? { ...tab, id: noteId } : tab
        )
      );
      setActiveTabId(noteId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <LoadingState
          title="Loading notes..."
          description="Please wait while we fetch your notes."
          className="text-white"
        />
      </div>
    );
  }
  if (createNoteError) {
    const errorMessage =
      createNoteError instanceof Error
        ? createNoteError.message
        : "Note could not be created";
    const errorDetails =
      process.env.NODE_ENV === "development"
        ? JSON.stringify(createNoteError)
        : null;

    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4 text-center space-y-4">
        <div className="text-destructive">
          <h3 className="text-lg font-semibold">Error Creating Note</h3>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>

        {errorDetails && (
          <pre className="text-xs text-left bg-muted p-2 rounded overflow-auto max-w-full max-h-40">
            {errorDetails}
          </pre>
        )}

        <Button onClick={handleCreateNote} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to load notes";
    const errorDetails =
      process.env.NODE_ENV === "development" ? JSON.stringify(error) : null;

    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4 text-center space-y-4">
        <div className="text-destructive">
          <h3 className="text-lg font-semibold">Error Loading Notes</h3>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>

        {errorDetails && (
          <pre className="text-xs text-left bg-muted p-2 rounded overflow-auto max-w-full max-h-40">
            {errorDetails}
          </pre>
        )}

        <Button onClick={refetch} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <NotesTabsManager
        tabs={tabs}
        activeTabId={activeTabId}
        onReorder={setTabs}
        onDeleteNote={handleDeleteTab}
        onAddNote={handleCreateNote}
        onTabClick={handleTabClick}
      />

      <div className="mt-12 h-[calc(100%-3rem)] overflow-auto custom-scrollbar">
        {activeTabId === HOME_TAB_ID ? (
          // Home view - show list of recent notes
          <div className="p-6 h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Your Notes</h2>
                <p className="text-sm text-muted-foreground">
                  Click on a note to open it, or create a new one
                </p>
              </div>
              {/** refresh button */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex-shrink-0"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
            {sortedNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 text-center p-8 border border-dashed border-border rounded-lg">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">No notes yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your first note to start annotating this document.
                  </p>
                </div>
                <Button
                  onClick={handleCreateNote}
                  className="cursor-pointer"
                  disabled={isLoadingNewNote}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Note
                </Button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div className="flex flex-col gap-2">
                  {sortedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={handleNoteCardClick}
                      onDelete={handleDeleteNote}
                      isDeleting={isLoadingDeleteNote}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Note editor view
          <div className="h-full">
            {isLoadingNote ? (
              <div className="flex justify-center items-center h-full">
                <LoadingState
                  title="Loading note..."
                  description="Please wait..."
                />
              </div>
            ) : activeNoteContent ? (
              // Editing existing note
              <div className="p-8 h-full flex flex-col">
                <div className="flex-1 h-full">
                  <NotionEditor
                    noteId={activeNoteContent.id}
                    content={{
                      title: activeNoteContent.title,
                      content: activeNoteContent.content,
                    }}
                    pdfId={pdfDocument.id}
                    autoSave={true}
                    autoSaveDelay={500}
                  />
                </div>
              </div>
            ) : (
              <p>Not found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
