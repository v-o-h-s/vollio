"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RobustNotionEditor } from "@/components/editor/RobustNotionEditor";
import { AutoSaveStatus } from "@/components/editor/AutoSaveStatus";
import { FloatingAutoSaveStatus } from "@/components/dashboard/FloatingAutoSaveStatus";

import { useAutoSave } from "@/hooks/use-auto-save";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Rectangle } from "@/lib/types/document"; 
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
  documentId: string;
  documentDocumentname: string;
}

function NewNotePageContent() {
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

  // RTK Query mutations for Document annotations
  const [createAnnotation] = useCreateAnnotationMutation();

  // Create annotation when note is created if we the note creating is triggered by text selection
  const createAnnotationForNote = useCallback(
    async (noteId: string) => {
      if (!selectionData || annotationCreated) return;

      try {
        // Get the current note content as text for the annotation
        const noteContentText = noteContent.title || "Untitled Note";
        
        await createAnnotation({
          documentId: selectionData.documentId,
          noteId: noteId,
          selectedText: selectionData.text,
          pageNumber: selectionData.pageNumber,
          coordinates: selectionData.coordinates,
          noteContent: noteContentText, // Use the note title as annotation content
        }).unwrap();

        setAnnotationCreated(true);
        console.log("Annotation created successfully, linking to note:", noteId);

        // Note: Cross-tab sync for annotations will be handled by the annotation API
        // The Document viewer will automatically update when the annotation is created
      } catch (error) {
        console.error("Failed to create annotation:", error);
        // Don't throw - annotation creation failure shouldn't break note creation
      }
    },
    [selectionData, noteContent.title, annotationCreated, createAnnotation]
  );

  // Handle note creation success
  const handleNoteCreated = useCallback(
    (newNoteId: string) => {
      setNoteId(newNoteId);
      // Create annotation if this note was created from Document text selection
      createAnnotationForNote(newNoteId);
    },
    [createAnnotationForNote]
  );

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

  // Handle go back - navigate back to Document if we came from annotation
  const handleGoBack = useCallback(() => {
    if (selectionData) {
      // Try to navigate back to the Document tab
      const documentUrl = `/dashboard/documents?document=${selectionData.documentId}`;

      // Try cross-tab navigation first
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.location.href = documentUrl;
          window.opener.focus();
          window.close();
          return;
        } catch (error) {
          console.warn("Cross-tab navigation failed:", error);
        }
      }

      // Fallback to regular navigation
      router.push(documentUrl);
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
    return "New Note"; // Simple default since we store title separately
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="flex items-center justify-between p-4 lg:px-8 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
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
                        Document Annotation
                      </Badge>
                      <span className="truncate">
                        {selectionData.documentDocumentname}
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
                    const documentUrl = `/dashboard/documents?document=${selectionData.documentId}`;
                    if (window.opener && !window.opener.closed) {
                      try {
                        window.opener.location.href = documentUrl;
                        window.opener.focus();
                      } catch (error) {
                        router.push(documentUrl);
                      }
                    } else {
                      router.push(documentUrl);
                    }
                  }}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline">View in Document</span>
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
              <div className="max-w-4xl mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
                <RobustNotionEditor
                  content={noteContent.content}
                  placeholder="Start writing your note..."
                  autoFocus={true}
                  autoSave={true}
                  noteId={noteId || undefined}
                  onAutoSaveStatusChange={handleAutoSaveStatusChange}
                  onNoteCreated={handleNoteCreated}
                  autoSaveDelay={1000}
                  className="min-h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-12rem)] border-none shadow-none bg-transparent prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none max-w-none"
                />
              </div>
            </div>
          </div>

          {/* Auto-save status is shown in the header */}
        </div>
      </div>
      <FloatingAutoSaveStatus />
    </ErrorBoundary>
  );
}

export default function NewNotePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <NewNotePageContent />
    </Suspense>
  );
}
