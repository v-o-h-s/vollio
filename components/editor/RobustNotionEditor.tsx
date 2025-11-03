"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { NotionEditor } from "./NotionEditor";
import { EditorErrorBoundary } from "./EditorErrorBoundary";
import { useEditorErrorRecovery } from "@/hooks/use-editor-error-recovery";
import { cn } from "@/lib/utils";
import type { NotionEditorProps } from "./types";

interface RobustNotionEditorProps
  extends Omit<NotionEditorProps, "onChange"> {
  onNoteCreated?: (noteId: string) => void;
}

export function RobustNotionEditor({
  content,
  placeholder = "Start writing...",
  autoFocus = false,
  autoSave = false,
  noteId,
  onAutoSaveStatusChange,
  onNoteCreated,
  autoSaveDelay = 2000,
  className,
}: RobustNotionEditorProps) {
  const [editorKey, setEditorKey] = useState(0);
  const contentRef = useRef(content);

  // Update content ref when content changes
  useEffect(() => {
    if (content !== undefined) {
      contentRef.current = content;
    }
  }, [content]);

  const {
    hasError,
    errorMessage,
    retryCount,
    handleError,
    handleRecovery,
    canRetry,
  } = useEditorErrorRecovery({
    maxRetries: 3,
    onRecovery: () => {
      // Force re-render with incremented key
      
      setEditorKey((prev) => prev + 1);
    },
  });

  // Enhanced onChange handler with error protection - removed since NotionEditor handles internally
  // const handleChange = useCallback(...) - No longer needed
  // onSaveSuccess handler - removed since NotionEditor handles internally

  // Recovery handler
  const handleRetry = useCallback(() => {
    handleRecovery();
  }, [handleRecovery]);

  if (hasError) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-8 text-center",
          className
        )}
      >
        <div className="max-w-md space-y-4">
          <div className="text-destructive">
            <h3 className="font-semibold">Editor Error</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {errorMessage || "The editor encountered an unexpected error."}
            </p>
          </div>

          {canRetry && (
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Retry ({retryCount}/3)
            </button>
          )}

          <div className="text-xs text-muted-foreground">
            Your content has been preserved and will be restored when the editor
            recovers.
          </div>
        </div>
      </div>
    );
  }

  return (
    <EditorErrorBoundary
      onError={handleError}
      fallback={
        <div
          className={cn(
            "flex flex-col items-center justify-center p-8",
            className
          )}
        >
          <div className="text-center space-y-4">
            <div className="text-destructive">
              <h3 className="font-semibold">Editor Crashed</h3>
              <p className="text-sm text-muted-foreground">
                The editor has crashed unexpectedly.
              </p>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Restart Editor
            </button>
          </div>
        </div>
      }
    >
      <NotionEditor
        key={editorKey}
        content={contentRef.current}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoSave={autoSave}
        noteId={noteId}
        onAutoSaveStatusChange={onAutoSaveStatusChange}
        onNoteCreated={onNoteCreated}
        autoSaveDelay={autoSaveDelay}
        className={className}
      />
    </EditorErrorBoundary>
  );
}
