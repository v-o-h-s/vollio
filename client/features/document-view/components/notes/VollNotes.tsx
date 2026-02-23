import { DocumentDocument } from "@/lib/types/document";
import NotesTabsManager, { Tab } from "./NotesTabsManager";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  LuPlus as Plus,
  LuRefreshCw as RefreshCw,
  LuFileText as FileText,
  LuZap as Zap,
} from "react-icons/lu";
import { cn } from "@/lib/utils";
import { FiHome as Home } from "react-icons/fi";
import { RiRobot3Fill as Sparkles } from "react-icons/ri";
import { LoadingState } from "@/components/ui/loading";
import { FeatureErrorDialog } from "@/components/errors/FeatureErrorDialog";
import { NoteCard } from "./NoteCard";
import { NoteEditorTab } from "./NoteEditorTab";
import { DocumentDetails } from "../../types/document";
import { HOME_TAB_ID, useViewer } from "../../context/ViewerContext";

export default function VollNotes({
  document,
  isFocused,
}: {
  document: DocumentDetails;
  isFocused?: boolean;
}) {
  const {
    tabs,
    activeTabId,
    isRefreshing,
    deletingNoteId,
    createNewEmptyNote,
    closeNoteTab,
    permanentlyDeleteNote,
    refreshDocumentNotes,
    switchToActiveNoteTab,
    openNoteFromList,
    syncNoteTitleWithTab,
    isLoadingNotes: isLoading,
    notesError: error,
    sortedNotes,
    isLoadingNewNote,
    createNoteError,
    refetchNotes: refetch,
    setTabs,
    summaryNote,
    generateSummary,
    isGenerating,
    summaryError,
    resetSummary,
  } = useViewer();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <LoadingState
          title="Loading Voll-notes..."
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

        <Button
          onClick={() => createNewEmptyNote()}
          variant="outline"
          size="sm"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (error) {
    // ... rest of error logic
  }

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  // Sync error modal with summary error
  useEffect(() => {
    if (summaryError) {
      setIsErrorModalOpen(true);
    }
  }, [summaryError]);

  return (
    <div className="h-full w-full relative">
      <NotesTabsManager
        tabs={tabs}
        activeTabId={activeTabId}
        onReorder={setTabs}
        onDeleteNote={closeNoteTab}
        onAddNote={() => createNewEmptyNote()}
        onTabClick={switchToActiveNoteTab}
        isFocused={isFocused}
      />

      <div className="mt-12 h-[calc(100%-3rem)] overflow-auto custom-scrollbar">
        {activeTabId === HOME_TAB_ID ? (
          // Home view - show list of recent notes
          <div className="p-6 h-full flex flex-col">
            <div className="mb-6 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-semibold mb-2">Voll-notes</h2>
                <p className="text-sm text-muted-foreground">
                  Click on a note to open it, or create a new one
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={refreshDocumentNotes}
                  disabled={isRefreshing}
                  className="shrink-0"
                  title="Refresh Notes"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>

            {/* Show Generate Summary button with inline error handling */}
            {!summaryNote && (
              <div className="mb-6">
                <Button
                  onClick={() => {
                    if (summaryError) {
                      setIsErrorModalOpen(true);
                    } else {
                      generateSummary();
                    }
                  }}
                  disabled={isGenerating}
                  className={cn(
                    "w-full h-auto py-4 px-6 border-2 transition-all duration-300 shadow-sm hover:shadow-md group flex flex-col items-center",
                    !summaryError &&
                      "bg-linear-to-r from-indigo-500/10 to-indigo-500/5 border-indigo-500/30 hover:border-indigo-500/50 text-indigo-600 dark:text-indigo-400",
                    summaryError?.name === "QuotaExceededError" &&
                      "bg-linear-to-r from-red-500/10 to-red-500/5 border-red-500/30 hover:border-red-500/50 text-red-600 dark:text-red-400",
                    summaryError &&
                      summaryError.name !== "QuotaExceededError" &&
                      "bg-linear-to-r from-orange-500/10 to-orange-500/5 border-orange-500/30 hover:border-orange-500/50 text-orange-600 dark:text-orange-400",
                  )}
                  variant="outline"
                >
                  <div className="flex items-center justify-center gap-3 w-full">
                    <div className="shrink-0">
                      {isGenerating ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : summaryError?.name === "QuotaExceededError" ? (
                        <Zap className="w-5 h-5 text-red-500" />
                      ) : (
                        <Sparkles
                          className={cn(
                            "w-5 h-5 transition-transform group-hover:scale-110",
                            summaryError && "text-orange-500",
                          )}
                        />
                      )}
                    </div>
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-base font-semibold truncate w-full">
                        {isGenerating
                          ? "Generating Summary..."
                          : "Generate Summary"}
                      </span>
                      <span className="text-xs text-muted-foreground font-normal truncate w-full">
                        {isGenerating
                          ? "AI is analyzing your document..."
                          : "AI-powered document summary"}
                      </span>
                    </div>
                  </div>
                </Button>
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
                  onClick={() => createNewEmptyNote()}
                  className="cursor-pointer bg-indigo-500 hover:bg-indigo-600 text-white"
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
                      onClick={openNoteFromList}
                      onDelete={permanentlyDeleteNote}
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
                onTitleChange={syncNoteTitleWithTab}
              />
            </div>
          ))}
      </div>

      <FeatureErrorDialog
        error={summaryError || null}
        isOpen={isErrorModalOpen}
        onClose={() => {
          setIsErrorModalOpen(false);
          resetSummary();
        }}
        onRetry={() => {
          resetSummary();
          generateSummary();
        }}
        title={
          summaryError?.name === "QuotaExceededError"
            ? "Summary Limit Reached"
            : summaryError?.name === "RateLimitingError"
              ? "Please Wait"
              : "Summary Generation Failed"
        }
      />
    </div>
  );
}
