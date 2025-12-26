import { PDFDocument } from "@/lib/types/pdf";
import NotesTabsManager, { Tab } from "./NotesTabsManager";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Home, RefreshCw } from "lucide-react";
import {
  useGetNotesQuery,
  useDeleteNoteMutation,
  useCreateNoteMutation,
} from "@/lib/store/apiSlice";
import { LoadingState } from "@/components/ui/loading";
import { NoteCard } from "./NoteCard";
import { NoteEditorTab } from "./NoteEditorTab";
import { FileDetails } from "../../types/document";
import { useViewer } from "../../context/ViewerContext";
import { HOME_TAB_ID, useNoterActions } from "../../hooks/useNoterActions";

export default function Noter({ file }: { file: FileDetails }) {
  const {
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
    sortedNotes,
    isLoadingNewNote,
    createNoteError,
    refetch,
    setTabs,
  } = useNoterActions(file);

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
                      isDeleting={deletingNoteId === note.id}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Render all open note editors - hidden when not active */}
        {tabs
          .filter((tab) => !tab.isHome)
          .map((tab) => (
            <div
              key={tab.id}
              className={`h-full ${
                activeTabId === tab.id ? "block" : "hidden"
              }`}
            >
              <NoteEditorTab
                noteId={tab.id}
                fileId={file.id}
                isActive={activeTabId === tab.id}
                onTitleChange={handleTitleChange}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
