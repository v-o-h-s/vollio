"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Loader2,
  Check,
  AlertCircle,
  Clock,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RobustNotionEditor } from "@/components/editor/RobustNotionEditor";
import { AutoSaveStatus } from "@/components/editor/AutoSaveStatus";

import { useAutoSave } from "@/hooks/use-auto-save";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { cn } from "@/lib/utils";

interface NewNoteContent {
  title?: string;
  content: any;
}

export default function NewNotePage() {
  const router = useRouter();
  // Responsive design handled via CSS
  const [noteContent, setNoteContent] = useState<NewNoteContent>({
    content: null,
  });
  const [noteId, setNoteId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save functionality
  const handleAutoSave = useCallback(
    async (content: any) => {
      try {
        if (!noteId) {
          // Create new note first
          setIsCreating(true);
          const response = await fetch("/api/notes", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: extractTitleFromContent(content) || "Untitled Note",
              content,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create note");
          }

          const result = await response.json();
          setNoteId(result.data.id);
          setIsCreating(false);
        } else {
          // Update existing note
          const response = await fetch(`/api/notes/${noteId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: extractTitleFromContent(content) || "Untitled Note",
              content,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to save note");
          }
        }
      } catch (error) {
        setIsCreating(false);
        throw error;
      }
    },
    [noteId]
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

  // Handle successful save is now handled via onSaveSuccess callback

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

  // Keyboard shortcuts
  useKeyboardShortcuts({
    "mod+s": (event) => {
      event.preventDefault();
      handleManualSave();
    },
    "escape": (event) => {
      event.preventDefault();
      if (!hasUnsavedChanges || confirm("You have unsaved changes. Are you sure you want to leave?")) {
        handleGoBack();
      }
    },
  });

  // Warn user before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges || autoSaveStatus === "saving" || isCreating) {
        event.preventDefault();
        return "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, autoSaveStatus, isCreating]);

  // Get current note title for display
  const getCurrentTitle = () => {
    const extracted = extractTitleFromContent(noteContent.content);
    return extracted || "New Note";
  };

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

                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
              <AutoSaveStatus
                status={isCreating ? "saving" : autoSaveStatus}
                lastSaved={lastSaved}
                error={autoSaveError}
                isCreating={isCreating}
                size="sm"
              />
              
              <Button
                variant="outline"
                size="default"
                onClick={handleManualSave}
                disabled={
                  !noteContent.content ||
                  autoSaveStatus === "saving" ||
                  isCreating
                }
                className="flex items-center gap-2 text-white border-[#3B82F6] hover:bg-[#3B82F6]/90"
                style={{ backgroundColor: '#3B82F6' }}
              >
                {autoSaveStatus === "saving" || isCreating ? (
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
                  autoFocus={true}
                  autoSave={true}
                  noteId={noteId || undefined}
                  onAutoSave={(content, id) => handleAutoSave(content)}
                  autoSaveDelay={1000}
                  className="min-h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-12rem)] border-none shadow-none bg-transparent"
                  editorProps={{
                    attributes: {
                      class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none max-w-none",
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Auto-save status is shown in the header */}
        </div>
      </div>
    </ErrorBoundary>
  );
}
