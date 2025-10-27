"use client";
import React, { useState, useCallback, useEffect } from "react";
import { NotionEditor } from "@/components/editor/NotionEditor";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  X,
  FileText,
  Maximize2,
  Minimize2,
  Save,
  Plus,
} from "lucide-react";
import { useGetNoteQuery } from "@/lib/store/apiSlice";
import { AutoSaveStatusProvider } from "@/components/dashboard/AutoSaveStatusProvider";
import { FloatingAutoSaveStatus } from "@/components/dashboard/FloatingAutoSaveStatus";
import { cn } from "@/lib/utils";
import { createPortal } from "react-dom";

interface UnifiedNoteModalProps {
  // Common props
  onClose: () => void;

  // For existing note preview
  noteId?: string | null;

  // For new note creation
  selectedText?: string;
  pdfTitle?: string;
  onNoteCreated?: (noteId: string) => void;
  onNoteSaved?: () => void; // Called when user explicitly saves the note

  // Modal configuration
  mode?: "preview" | "create";
  title?: string;
}

export function UnifiedNoteModal({
  onClose,
  noteId,
  selectedText,
  pdfTitle,
  onNoteCreated,
  onNoteSaved,
  mode = noteId ? "preview" : "create",
  title,
}: UnifiedNoteModalProps) {
  console.log(noteId);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch note data for preview mode - always call the hook to maintain hook order
  const {
    data: note,
    isLoading: isLoadingNote,
    error,
  } = useGetNoteQuery(noteId || "dummy", {
    skip: !noteId || mode !== "preview",
  });

  // Handle escape key and body scroll - modal is always open when component exists
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    // Prevent body scroll when modal is open
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  // Determine if this is a test mode
  const isTestMode = noteId === "test-note-id";

  // Determine modal title
  const getModalTitle = () => {
    if (title) return title;
    if (mode === "create") return "Create Note from Selection";
    if (isTestMode) return "Test Note Preview";
    if (isLoadingNote) return "Loading...";
    // Don't use fallback for existing notes - let the editor handle the title
    return note?.title || (mode === "preview" ? "Note Preview" : "New Note");
  };

  // Determine modal subtitle
  const getModalSubtitle = () => {
    if (mode === "create") return `From: ${pdfTitle || "PDF Document"}`;
    if (isTestMode) return "Test Mode";
    return "Note Preview";
  };

  const handleOpenInNewTab = useCallback(() => {
    if (noteId && mode === "preview") {
      const url = `/dashboard/notes/${noteId}`;
      window.open(url, "_blank");
    }
  }, [noteId, mode]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleNoteCreated = useCallback(
    (createdNoteId: string) => {
      console.log("📝 Note created in modal:", createdNoteId, "- keeping modal open for continued editing");
      // Don't close the modal when note is created - let user continue editing
      // Only notify parent for highlight creation, but don't trigger modal close
      if (onNoteCreated) {
        onNoteCreated(createdNoteId);
      }
    },
    [onNoteCreated]
  );

  const handleSaveClick = useCallback(() => {
    // Close the modal when user explicitly clicks save
    console.log("💾 Manual save clicked - closing modal and cleaning up selection");
    
    // Call the onNoteSaved callback to clean up selection state
    if (onNoteSaved) {
      onNoteSaved();
    }
    
    handleClose();
  }, [handleClose, onNoteSaved]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  // Component is only rendered when it should be visible

  if (mode === "preview" && !noteId) {
    console.log("UnifiedNoteModal: No noteId provided for preview mode");
    return null;
  }

  const modalContent = (
    <AutoSaveStatusProvider>
      <div
        className="unified-note-modal-container"
        onClick={handleBackdropClick}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm" />

        {/* Modal Container */}
        <div
          className={cn(
            "relative z-10 bg-background border border-border shadow-2xl rounded-lg overflow-hidden flex flex-col",
            "animate-in fade-in-0 zoom-in-95 duration-200",
            isFullscreen
              ? "w-[calc(100vw-2rem)] h-[calc(100vh-2rem)] max-w-none max-h-none"
              : "w-[90vw] max-w-4xl h-[85vh] max-h-[800px]"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Unified Header */}
          <div className="flex-shrink-0 bg-background border-b border-border">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="p-2 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  {mode === "create" ? (
                    <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-semibold text-foreground truncate">
                    {isLoadingNote ? (
                      <div className="h-6 bg-muted animate-pulse rounded w-48" />
                    ) : (
                      getModalTitle()
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {getModalSubtitle()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Fullscreen toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="h-8 w-8 p-0 hover:bg-muted/50"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>

                {/* Open in new tab (preview mode only) */}
                {mode === "preview" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleOpenInNewTab}
                    className="h-8 w-8 p-0 hover:bg-muted/50"
                    disabled={!noteId}
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}

                {/* Save button (create mode only) */}
                {mode === "create" && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveClick}
                    className="flex items-center gap-2 h-8"
                  >
                    <Save className="h-4 w-4" />
                    Save Note
                  </Button>
                )}

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0 hover:bg-muted/50"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Editor Container */}
          <div className="flex-1 overflow-hidden relative">
            <div
              className="h-full bg-background"
              style={{
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Test Mode Content */}
              {isTestMode ? (
                <div className="p-8 max-w-4xl mx-auto">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-4 text-foreground">
                        Test Note Modal
                      </h3>
                      <p className="text-muted-foreground text-lg leading-relaxed">
                        This is a test modal to verify the UnifiedNoteModal is
                        working correctly. If you can see this, the modal is
                        rendering properly.
                      </p>
                    </div>

                    <div className="p-6 bg-muted rounded-lg border border-border">
                      <h4 className="font-semibold mb-3 text-foreground">
                        Modal State:
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Open:</span>
                          <span className="ml-2 font-mono">true</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mode:</span>
                          <span className="ml-2 font-mono">{mode}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Note ID:
                          </span>
                          <span className="ml-2 font-mono">{noteId}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Fullscreen:
                          </span>
                          <span className="ml-2 font-mono">
                            {isFullscreen.toString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : /* Loading State */
              isLoadingNote ? (
                <div className="p-8 max-w-4xl mx-auto">
                  <div className="space-y-4">
                    <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                    <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
                    <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                    <div className="h-4 bg-muted animate-pulse rounded w-4/5" />
                  </div>
                </div>
              ) : /* Editor Content */
              mode === "create" || note ? (
                <div className="h-full">
                  <NotionEditor
                    noteId={
                      mode === "preview" ? noteId || undefined : undefined
                    }
                    content={
                      mode === "preview"
                        ? {
                            title: note?.title || "",
                            content: note?.content || null,
                          }
                        : mode === "create" && selectedText
                        ? {
                            title: selectedText.length > 60 
                              ? selectedText.substring(0, 60).trim() + "..." 
                              : selectedText.trim(), // Use selected text as title
                            content: {
                              type: "doc",
                              content: [
                                {
                                  type: "paragraph",
                                  content: [
                                    {
                                      type: "text",
                                      text: selectedText,
                                    },
                                  ],
                                },
                                {
                                  type: "paragraph",
                                  content: [],
                                },
                              ],
                            },
                          }
                        : mode === "create"
                        ? {
                            title: "", // Empty title for create mode without selected text
                            content: null,
                          }
                        : undefined
                    }
                    autoSave={true}
                    className="h-full notion-editor-modal"
                    placeholder={
                      mode === "create"
                        ? "Add your thoughts about the selected text..."
                        : "Start writing your note..."
                    }
                    editable={true}
                    autoFocus={mode === "create"}
                    onNoteCreated={
                      mode === "create" ? handleNoteCreated : undefined
                    }
                  />
                </div>
              ) : (
                /* Error State */
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <div className="p-4 bg-muted/30 rounded-full mb-4 w-fit mx-auto">
                      <FileText className="h-12 w-12 opacity-50" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Note not found</h3>
                    <p className="text-sm text-muted-foreground">
                      The requested note could not be loaded.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Text Reference (create mode only) */}
          {mode === "create" && selectedText && (
            <div className="flex-shrink-0 p-4 bg-muted border-t border-border">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Selected Text:
              </div>
              <div className="text-sm text-foreground italic bg-background p-2 rounded border border-border max-h-20 overflow-y-auto">
                "{selectedText}"
              </div>
            </div>
          )}

          {/* Auto-Save Status */}
          <FloatingAutoSaveStatus />
        </div>
      </div>
    </AutoSaveStatusProvider>
  );

  // Use portal to render modal at document body level
  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
}
