"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  FileText,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotionEditor } from "@/components/editor/NotionEditor";
import { FloatingAutoSaveStatus } from "@/components/dashboard/FloatingAutoSaveStatus";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";

import { useNoteSync } from "@/hooks/use-note-sync";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  useGetNoteQuery,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} from "@/lib/store/apiSlice";
import toast from "react-hot-toast";
import type { JSONContent } from "@tiptap/core";

interface NoteContent {
  title: string;
  content: JSONContent | null;
}

export default function NoteEditPage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params.id as string;

  // RTK Query hooks
  const { data: note, isLoading, error } = useGetNoteQuery(noteId);
  const [updateNote] = useUpdateNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();
  const [noteContent, setNoteContent] = useState<NoteContent>({
    title: "",
    content: null,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Cross-tab synchronization
  const { broadcastUpdate, broadcastDelete } = useNoteSync();

  // Initialize content when note loads
  useEffect(() => {
    if (note) {
      setNoteContent({
        title: note.title || "",
        content: note.content,
      });
    }
  }, [note]);

  // Handle go back
  const handleGoBack = useCallback(() => {
    router.push("/dashboard/notes");
  }, [router]);

  // Handle delete note
  const handleDelete = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    try {
      setIsDeleting(true);
      await deleteNote(noteId).unwrap();

      // Broadcast note deletion for cross-tab sync
      broadcastDelete(noteId);

      // Show success message
      toast.success("Note deleted successfully");

      // Navigate back to notes list
      router.push("/dashboard/notes");
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note. Please try again.");
      setIsDeleting(false);
    } finally {
      setShowDeleteDialog(false);
    }
  }, [noteId, deleteNote, broadcastDelete, router]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  // Warn user before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Get current note title for display
  const getCurrentTitle = () => {
    return noteContent.title || "Untitled Note";
  };

  // Calculate word count
  const getWordCount = () => {
    if (!noteContent.content || !noteContent.content.content) return 0;

    let text = "";
    const extractText = (node: any) => {
      if (node.type === "text") {
        text += node.text + " ";
      } else if (node.content) {
        node.content.forEach(extractText);
      }
    };

    noteContent.content.content.forEach(extractText);
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  // Loading state with improved styling
  if (isLoading) {
    return (
      <div className="flex h-screen bg-background overflow-x-hidden">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="absolute inset-0 h-8 w-8 rounded-full border-2 border-primary/20"></div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-foreground">
                Loading note...
              </h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we fetch your note
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with improved styling
  if (error) {
    return (
      <div className="flex h-screen bg-background overflow-x-hidden">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="mb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <ExternalLink className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-3">
              Note not found
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              The note you're looking for could not be found or you don't have
              permission to view it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleGoBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Notes
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background overflow-x-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <header className="flex items-center justify-between p-4 lg:px-6 border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center gap-3 lg:gap-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="flex items-center gap-2 hover:bg-accent/80 shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Notes</span>
                <span className="sm:hidden">Back</span>
              </Button>

              <div className="hidden sm:block h-5 w-px bg-border/60 shrink-0" />

              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <h1 className="text-lg lg:text-xl font-semibold text-foreground truncate leading-tight">
                    {getCurrentTitle()}
                  </h1>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      Last updated:{" "}
                      {note?.updatedAt
                        ? new Date(note.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Unknown"}
                    </span>
                    {noteContent.content && (
                      <>
                        <span>•</span>
                        <span>{getWordCount()} words</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
              {hasUnsavedChanges && (
                <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="hidden sm:inline">Unsaved changes</span>
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </header>

          {/* Enhanced Editor Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              <div className="max-w-4xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
                {noteContent.content !== null ? (
                  <NotionEditor
                    key={`editor-${noteId}`} // Force re-render when noteId changes
                    content={{
                      title: noteContent.title,
                      content: noteContent.content,
                    }}
                    placeholder="Start writing your note..."
                    autoFocus={false}
                    autoSave={true}
                    noteId={noteId}
                    autoSaveDelay={1500}
                    className="min-h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-12rem)] border-none shadow-none bg-transparent prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none max-w-none"
                  />
                ) : (
                  <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-12rem)]">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading content...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        noteTitle={getCurrentTitle()}
        isDeleting={isDeleting}
      />

    </ErrorBoundary>
  );
}
