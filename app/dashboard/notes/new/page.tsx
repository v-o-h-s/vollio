"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RobustNotionEditor } from "@/components/editor/RobustNotionEditor";
import { AutoSaveStatus } from "@/components/editor/AutoSaveStatus";

import { useAutoSave } from "@/hooks/use-auto-save";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Rectangle } from "@/lib/types";
import {
  useCreateAnnotationMutation,
} from "@/lib/store/apiSlice";

interface NewNoteContent {
  title?: string;
  content: any;
}

interface SelectionData {
  text: string;
  pageNumber: number;
  coordinates: Rectangle;
  pdfId: string;
  pdfFilename: string;
}

export default function NewNotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse selection data from URL params
  const [selectionData, setSelectionData] = useState<SelectionData | null>(
    null
  );
  const [noteContent, setNoteContent] = useState<NewNoteContent>({
    content: null,
  });
  const [noteId, setNoteId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [annotationCreated, setAnnotationCreated] = useState(false);
  
  // Auto-save status from editor
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "typing" | "saving" | "saved" | "error">("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null);

  // Parse selection data from URL on mount
  useEffect(() => {
    const selectionParam = searchParams.get("selection");
    if (selectionParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(selectionParam));
        setSelectionData(decoded);

        // Pre-populate editor with selected text
        const initialContent = {
          type: "doc",
          content: [
            {
              type: "blockquote",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: decoded.text,
                    },
                  ],
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "",
                },
              ],
            },
          ],
        };

        setNoteContent({ content: initialContent });
        console.log("Parsed selection data:", decoded);
      } catch (error) {
        console.error("Failed to parse selection data:", error);
      }
    }
  }, [searchParams]);

  // RTK Query mutations for PDF annotations
  const [createAnnotation] = useCreateAnnotationMutation();

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

  // Create annotation when note is created if we the note creating is triggered by text selection
  const createAnnotationForNote = useCallback(
    async (noteId: string) => {
      if (!selectionData || annotationCreated) return;

      try {
        await createAnnotation({
          pdfId: selectionData.pdfId,
          noteId: noteId,
          selectedText: selectionData.text,
          pageNumber: selectionData.pageNumber,
          coordinates: selectionData.coordinates,
          noteContent:
            extractTitleFromContent(noteContent.content) || "Untitled Note",
        }).unwrap();

        setAnnotationCreated(true);
        console.log("Annotation created successfully");

        // Note: Cross-tab sync for annotations will be handled by the annotation API
        // The PDF viewer will automatically update when the annotation is created
      } catch (error) {
        console.error("Failed to create annotation:", error);
        // Don't throw - annotation creation failure shouldn't break note creation
      }
    },
    [selectionData, noteContent.content, annotationCreated, createAnnotation]
  );

  // Handle note creation success - simplified since editor handles everything
  const handleSaveSuccess = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  // Handle editor content changes
  const handleEditorChange = useCallback(
    (content: any) => {
      setNoteContent((prev) => ({ ...prev, content }));
      setHasUnsavedChanges(true);
    },
    []
  );

  // Handle auto-save status changes from editor
  const handleAutoSaveStatusChange = useCallback(
    (status: { status: "idle" | "typing" | "saving" | "saved" | "error"; lastSaved: Date | null; error: string | null }) => {
      setAutoSaveStatus(status.status);
      setLastSaved(status.lastSaved);
      setAutoSaveError(status.error);
      
      // Reset unsaved changes flag when successfully saved
      if (status.status === "saved") {
        setHasUnsavedChanges(false);
      }
    },
    []
  );

  // Handle successful save is now handled via onSaveSuccess callback

  // Handle go back - navigate back to PDF if we came from annotation
  const handleGoBack = useCallback(() => {
    if (selectionData) {
      // Try to navigate back to the PDF tab
      const pdfUrl = `/dashboard/pdf-notes?pdf=${selectionData.pdfId}`;

      // Try cross-tab navigation first
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.location.href = pdfUrl;
          window.opener.focus();
          window.close();
          return;
        } catch (error) {
          console.warn("Cross-tab navigation failed:", error);
        }
      }

      // Fallback to regular navigation
      router.push(pdfUrl);
    } else {
      router.push("/dashboard/notes");
    }
  }, [router, selectionData]);

  // Handle manual save (mostly handled by auto-save now)
  const handleManualSave = useCallback(async () => {
    // Manual save is now handled internally by the editor
    // This is mainly for user feedback and ensuring save happens immediately
    if (autoSaveStatus === "typing" && noteContent.content) {
      setAutoSaveStatus("saving");
      // The editor will handle the actual save via auto-save
    }
  }, [autoSaveStatus, noteContent.content]);

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
      // Only warn if there are truly unsaved changes that haven't been auto-saved
      const hasTrueUnsavedChanges = hasUnsavedChanges && autoSaveStatus !== "saved";
      const isSaving = autoSaveStatus === "saving" || isCreating;
      
      if (hasTrueUnsavedChanges || isSaving) {
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
                  {selectionData && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        PDF Annotation
                      </Badge>
                      <span className="truncate">
                        {selectionData.pdfFilename}
                      </span>
                    </div>
                  )}
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

              {selectionData && noteId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const pdfUrl = `/dashboard/pdf-notes?pdf=${selectionData.pdfId}`;
                    if (window.opener && !window.opener.closed) {
                      try {
                        window.opener.location.href = pdfUrl;
                        window.opener.focus();
                      } catch (error) {
                        router.push(pdfUrl);
                      }
                    } else {
                      router.push(pdfUrl);
                    }
                  }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline">View in PDF</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="default"
                onClick={handleManualSave}
                disabled={
                  !noteContent.content ||
                  autoSaveStatus === "saving" ||
                  isCreating ||
                  (!hasUnsavedChanges && autoSaveStatus === "saved")
                }
                className="flex items-center gap-2 text-white border-[#3B82F6] hover:bg-[#3B82F6]/90"
                style={{ backgroundColor: "#3B82F6" }}
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
                  onSaveSuccess={handleSaveSuccess}
                  placeholder="Start writing your note..."
                  autoFocus={true}
                  autoSave={true}
                  noteId={noteId || undefined}
                  onAutoSaveStatusChange={handleAutoSaveStatusChange}
                  autoSaveDelay={1000}
                  className="min-h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-12rem)] border-none shadow-none bg-transparent prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none max-w-none"
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
