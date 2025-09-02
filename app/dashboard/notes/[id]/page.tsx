"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  FileText,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RobustNotionEditor } from "@/components/editor/RobustNotionEditor";
import { AutoSaveStatus } from "@/components/editor/AutoSaveStatus";

import { useAutoSave } from "@/hooks/use-auto-save";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useNoteSync } from "@/hooks/use-note-sync";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { 
  useGetNoteQuery,
  useUpdateNoteMutation,
  useDeleteNoteMutation 
} from "@/lib/store/apiSlice";

interface NoteContent {
  title?: string;
  content: any;
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
    content: null,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cross-tab synchronization
  const { broadcastUpdate, broadcastDelete } = useNoteSync();

  // Initialize content when note loads
  useEffect(() => {
    if (note) {
      setNoteContent({
        title: note.title,
        content: note.content,
      });
    }
  }, [note]);

  // Extract title from editor content
  const extractTitleFromContent = (content: any): string | null => {
    if (!content || !content.content) return null;

    const firstNode = content.content[0];
    if (firstNode && firstNode.type === "heading" && firstNode.content) {
      return firstNode.content.map((c: any) => c.text).join("");
    }

    if (firstNode && firstNode.type === "paragraph" && firstNode.content) {
      const text = firstNode.content.map((c: any) => c.text).join("");
      return text.length > 50 ? text.substring(0, 50) + "..." : text;
    }

    return null;
  };

  // Auto-save functionality
  const handleAutoSave = useCallback(
    async (content: any) => {
      try {
        const result = await updateNote({
          id: noteId,
          updates: {
            title: extractTitleFromContent(content) || "Untitled Note",
            content,
          },
        }).unwrap();

        // Broadcast note update for cross-tab sync
        broadcastUpdate(result);
      } catch (error) {
        throw error;
      }
    },
    [noteId, updateNote, broadcastUpdate]
  );

  const {
    status: autoSaveStatus,
    lastSaved,
    error: autoSaveError,
    updateContent,
  } = useAutoSave({
    onSave: handleAutoSave,
    delay: 1000, // 1 second delay for auto-save
    enabled: true,
  });

  // Handle editor content changes
  const handleEditorChange = useCallback(
    (content: any) => {
      setNoteContent((prev) => ({ ...prev, content }));
      setHasUnsavedChanges(true);

      // Only trigger auto-save if content is not empty
      if (content && content.content && content.content.length > 0) {
        updateContent(content);
      }
    },
    [updateContent]
  );

  // Handle go back
  const handleGoBack = useCallback(() => {
    router.push("/dashboard/notes");
  }, [router]);

  // Handle manual save
  const handleManualSave = useCallback(async () => {
    if (noteContent.content) {
      try {
        await handleAutoSave(noteContent.content);
      } catch (error) {
        console.error("Manual save failed:", error);
      }
    }
  }, [noteContent.content, handleAutoSave]);

  // Handle delete note
  const handleDelete = useCallback(async () => {
    if (!confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteNote(noteId).unwrap();
      
      // Broadcast note deletion for cross-tab sync
      broadcastDelete(noteId);
      
      // Navigate back to notes list
      router.push("/dashboard/notes");
    } catch (error) {
      console.error("Failed to delete note:", error);
      setIsDeleting(false);
    }
  }, [noteId, deleteNote, broadcastDelete, router]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    "mod+s": (event) => {
      event.preventDefault();
      handleManualSave();
    },
    escape: (event) => {
      event.preventDefault();
      if (
        !hasUnsavedChanges ||
        confirm("You have unsaved changes. Are you sure you want to leave?")
      ) {
        handleGoBack();
      }
    },
  });

  // Warn user before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || autoSaveStatus === "saving") {
        event.preventDefault();
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, autoSaveStatus]);

  // Get current note title for display
  const getCurrentTitle = () => {
    const extracted = extractTitleFromContent(noteContent.content);
    return extracted || note?.title || "Untitled Note";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-background -m-6 lg:-m-8 lg:-ml-12">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading note...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-background -m-6 lg:-m-8 lg:-ml-12">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Failed to load note</h2>
            <p className="text-muted-foreground mb-4">
              The note could not be found or you don't have permission to view it.
            </p>
            <Button onClick={handleGoBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background -m-6 lg:-m-8 lg:-ml-12">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between p-4 lg:px-6 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-2 lg:gap-4 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="default"
                onClick={handleGoBack}
                className="flex items-center gap-2 hover:bg-accent shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Notes</span>
                <span className="sm:hidden">Back</span>
              </Button>

              <div className="hidden sm:block h-6 w-px bg-border shrink-0" />

              <div className="flex items-center gap-3 min-w-0 flex-1">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex flex-col min-w-0 flex-1">
                  <h1 className="text-base lg:text-lg font-semibold text-foreground truncate">
                    {getCurrentTitle()}
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      Last updated: {note?.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
              <AutoSaveStatus
                status={autoSaveStatus}
                lastSaved={lastSaved}
                error={autoSaveError}
                size="sm"
              />

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Delete</span>
              </Button>

              <Button
                variant="outline"
                size="default"
                onClick={handleManualSave}
                disabled={
                  !noteContent.content ||
                  autoSaveStatus === "saving"
                }
                className="flex items-center gap-2 text-white border-[#3B82F6] hover:bg-[#3B82F6]/90"
                style={{ backgroundColor: "#3B82F6" }}
              >
                {autoSaveStatus === "saving" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Save</span>
              </Button>
            </div>
          </header>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              <div className="max-w-4xl mx-auto w-full p-3 lg:p-6">
                <RobustNotionEditor
                  content={noteContent.content}
                  onChange={handleEditorChange}
                  onSaveSuccess={() => setHasUnsavedChanges(false)}
                  placeholder="Start writing your note..."
                  autoFocus={false}
                  autoSave={true}
                  noteId={noteId}
                  onAutoSave={(content) => handleAutoSave(content)}
                  autoSaveDelay={1000}
                  className="min-h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-12rem)] border-none shadow-none bg-transparent prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none max-w-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}