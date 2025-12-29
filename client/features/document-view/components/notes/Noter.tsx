import { DocumentDocument } from "@/lib/types/document";
import NotesTabsManager, { Tab } from "./NotesTabsManager";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Home, RefreshCw, Sparkles, FileText } from "lucide-react";
import {
  useGetNotesQuery,
  useDeleteNoteMutation,
  useCreateNoteMutation,
} from "@/lib/store/apiSlice";
import { LoadingState } from "@/components/ui/loading";
import { NoteCard } from "./NoteCard";
import { NoteEditorTab } from "./NoteEditorTab";
import { DocumentDetails } from "../../types/document";
import { HOME_TAB_ID, useViewer } from "../../context/ViewerContext";
import { useSummaryActions } from "../../hooks/useSummaryActions";

export default function Noter({ document }: { document: DocumentDetails }) {
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
    isLoadingNotes: isLoading,
    notesError: error,
    sortedNotes,
    isLoadingNewNote,
    createNoteError,
    refetchNotes: refetch,
    setTabs,
  } = useViewer();

  const { summary, generateSummary, isGenerating } = useSummaryActions(
    document.id
  );

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

        <Button onClick={() => handleCreateNote()} variant="outline" size="sm">
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
        onAddNote={() => handleCreateNote()}
        onTabClick={handleTabClick}
      />

      <div className="mt-12 h-[calc(100%-3rem)] overflow-auto custom-scrollbar">
        {activeTabId === HOME_TAB_ID ? (
          // Home view - show list of recent notes
          <div className="p-6 h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Your Notes</h2>
                <p className="text-sm text-muted-foreground">
                  Click on a note to open it, or create a new one
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="shrink-0"
                  title="Refresh Notes"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateSummary}
                  disabled={isGenerating}
                  className="shrink-0 gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                  title="Generate AI Summary"
                >
                  <Sparkles
                    className={`w-4 h-4 text-primary ${
                      isGenerating ? "animate-spin" : ""
                    }`}
                  />
                  <span>Generate Summary</span>
                </Button>
              </div>
            </div>

            {summary && (
              <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-primary flex items-center gap-2 uppercase tracking-wider">
                    <FileText className="w-4 h-4" />
                    Document Summary
                  </h3>
                </div>
                <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {summary.text}
                </div>
              </div>
            )}

            {sortedNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 text-center p-8 border border-dashed border-border rounded-lg">
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">No notes yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your first note to start annotating this document.
                  </p>
                </div>
                <Button
                  onClick={() => handleCreateNote()}
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
                documentId={document.id}
                isActive={activeTabId === tab.id}
                onTitleChange={handleTitleChange}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
