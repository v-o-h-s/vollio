"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateNoteMutation } from "@/lib/store/apiSlice";
import { LazyNotionEditor } from "@/components/editor/LazyNotionEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Save, 
  FileText,
  Maximize2,
  Focus,
  Eye
} from "lucide-react";
import { JSONContent } from "@/lib/types";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useNoteSync } from "@/hooks/use-note-sync";
import { noteNotifications } from "@/lib/utils/note-notifications";
import { cn } from "@/lib/utils";
import type { EditorMode } from "@/components/editor/types";

/**
 * Interface for PDF selection data passed via URL params
 */
interface PDFSelectionData {
  text: string;
  pageNumber: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  pdfId: string;
  pdfFilename: string;
}

/**
 * New Note Creation Page
 * 
 * Allows users to create new notes with the Notion-like editor.
 * Can be initialized with PDF annotation data for linked notes.
 * Supports multiple viewing modes: normal, fullscreen, and focus.
 */
const NewNotePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<JSONContent>({
    type: "doc",
    content: [{ type: "paragraph" }],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectionData, setSelectionData] = useState<PDFSelectionData | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('normal');
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);

  // Mutations
  const [createNote] = useCreateNoteMutation();

  // Cross-tab synchronization
  const { broadcastCreate } = useNoteSync();

  // Handle mode changes with animations
  const handleModeChange = useCallback((newMode: EditorMode) => {
    setEditorMode(newMode);
    
    // Show keyboard hint for focus mode
    if (newMode === 'focus') {
      setShowKeyboardHint(true);
      setTimeout(() => setShowKeyboardHint(false), 3000);
    }
  }, []);

  // Keyboard shortcuts for mode switching
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // F11 for focus mode
      if (event.key === 'F11') {
        event.preventDefault();
        handleModeChange(editorMode === 'focus' ? 'normal' : 'focus');
      }
      
      // Escape to exit focus mode
      if (event.key === 'Escape' && editorMode === 'focus') {
        event.preventDefault();
        handleModeChange('normal');
      }
      
      // Ctrl/Cmd + Shift + F for fullscreen
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'F') {
        event.preventDefault();
        handleModeChange(editorMode === 'fullscreen' ? 'normal' : 'fullscreen');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editorMode, handleModeChange]);

  // Parse selection data from URL params if present
  useEffect(() => {
    const selectionParam = searchParams.get("selection");
    const annotationId = searchParams.get("annotationId");
    
    if (selectionParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(selectionParam)) as PDFSelectionData;
        setSelectionData(parsed);
        
        // Set initial title based on PDF selection
        setTitle(`Note from ${parsed.pdfFilename}`);
        
        // Set initial content with the selected text
        setContent({
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
                      text: parsed.text,
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
                  text: `From page ${parsed.pageNumber} of ${parsed.pdfFilename}`,
                  marks: [{ type: "italic" }],
                },
              ],
            },
            {
              type: "paragraph",
            },
          ],
        });
      } catch (error) {
        console.error("Failed to parse selection data:", error);
      }
    } else if (annotationId) {
      // If we have an annotation ID, set up the note to be linked to it
      setTitle("Note for PDF Annotation");
      setContent({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This note is linked to a PDF annotation.",
                marks: [{ type: "italic" }],
              },
            ],
          },
          {
            type: "paragraph",
          },
        ],
      });
    }
  }, [searchParams]);

  const handleSave = async () => {
    if (!title.trim()) {
      noteNotifications.createError("Please enter a title for your note");
      return;
    }

    setIsSaving(true);
    const loadingToast = noteNotifications.loading("Creating note...");
    
    try {
      const annotationId = searchParams.get("annotationId");
      
      const result = await createNote({
        title: title.trim(),
        content,
        pdfAnnotationId: annotationId || undefined,
      }).unwrap();

      // Broadcast creation to other tabs
      broadcastCreate(result);

      // If we have selection data, we need to create an annotation
      if (selectionData) {
        // TODO: Create annotation and link it to the note
        // This would involve calling the annotations API
        console.log("TODO: Create annotation for selection:", selectionData);
      }

      noteNotifications.dismiss(loadingToast);
      noteNotifications.createSuccess(title.trim());
      router.push(`/dashboard/notes/${result.id}`);
    } catch (error) {
      console.error("Failed to create note:", error);
      noteNotifications.dismiss(loadingToast);
      noteNotifications.createError();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Mode toggle handlers
  const handleToggleFullscreen = () => {
    handleModeChange(editorMode === 'fullscreen' ? 'normal' : 'fullscreen');
  };

  const handleToggleFocus = () => {
    handleModeChange(editorMode === 'focus' ? 'normal' : 'focus');
  };

  const handleExitMode = () => {
    handleModeChange('normal');
  };

  // Render mode toggle buttons
  const renderModeToggle = () => {
    if (editorMode === 'focus') return null;

    return (
      <div className="flex items-center gap-2 p-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleModeChange('normal')}
            className={cn(
              "mode-toggle-button",
              editorMode === 'normal' && "active"
            )}
            title="Normal mode"
          >
            <Eye size={16} />
            <span>Normal</span>
          </button>
          
          <button
            onClick={handleToggleFullscreen}
            className={cn(
              "mode-toggle-button",
              editorMode === 'fullscreen' && "active"
            )}
            title="Fullscreen mode (Ctrl+Shift+F)"
          >
            <Maximize2 size={16} />
            <span>Fullscreen</span>
          </button>
          
          <button
            onClick={handleToggleFocus}
            className={cn(
              "mode-toggle-button",
              editorMode === 'focus' && "active"
            )}
            title="Focus mode (F11)"
          >
            <Focus size={16} />
            <span>Focus</span>
          </button>
        </div>
        
        <div className="mode-indicator">
          {editorMode === 'normal' && <Eye size={12} />}
          {editorMode === 'fullscreen' && <Maximize2 size={12} />}
          {editorMode === 'focus' && <Focus size={12} />}
          <span>{editorMode.charAt(0).toUpperCase() + editorMode.slice(1)}</span>
        </div>
      </div>
    );
  };

  // Render floating controls for focus mode
  const renderFocusControls = () => {
    if (editorMode !== 'focus') return null;

    return (
      <>
        {/* Exit button */}
        <button
          onClick={handleExitMode}
          className="focus-mode-exit-button"
          title="Exit focus mode (Esc)"
        >
          <ArrowLeft size={16} />
          <span>Exit Focus</span>
        </button>

        {/* Floating controls */}
        <div className="focus-mode-controls">
          <button
            onClick={handleToggleFullscreen}
            title="Switch to fullscreen mode"
          >
            <Maximize2 size={16} />
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            title="Save note"
          >
            <Save size={16} />
          </button>
        </div>
      </>
    );
  };

  // Render keyboard hint
  const renderKeyboardHint = () => {
    if (!showKeyboardHint) return null;

    return (
      <div className="keyboard-hint">
        Press <strong>Esc</strong> to exit focus mode, <strong>F11</strong> to toggle
      </div>
    );
  };

  // Get container classes based on mode
  const getContainerClass = () => {
    const baseClass = "editor-layout layout-transition";
    const modeClass = `editor-${editorMode}`;
    
    if (editorMode === 'normal') {
      return `${baseClass} ${modeClass} container mx-auto px-4 py-8 max-w-4xl`;
    }
    
    return `${baseClass} ${modeClass}`;
  };

  // Render header (only in normal and fullscreen modes)
  const renderHeader = () => {
    if (editorMode === 'focus') return null;

    return (
      <div className={cn(
        "flex items-center justify-between mb-6",
        editorMode === 'fullscreen' && "px-8 pt-8"
      )}>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Note</h1>
            {selectionData && (
              <p className="text-sm text-gray-600">
                Creating note from PDF selection
              </p>
            )}
          </div>
        </div>
        
        <Button
          onClick={handleSave}
          disabled={isSaving || !title.trim()}
          className="flex items-center gap-2"
        >
          <Save size={16} />
          {isSaving ? "Saving..." : "Save Note"}
        </Button>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <div className={getContainerClass()}>
        {renderModeToggle()}
        
        <div className={cn(
          "editor-content-wrapper",
          `mode-${editorMode}`
        )}>
          <div className="editor-content">
            {renderHeader()}

            {/* Selection Info Card */}
            {selectionData && editorMode !== 'focus' && (
              <Card className={cn(
                "p-4 mb-6 bg-blue-50 border-blue-200",
                editorMode === 'fullscreen' && "mx-8"
              )}>
                <div className="flex items-start gap-3">
                  <FileText size={20} className="text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 mb-1">
                      PDF Selection
                    </h3>
                    <p className="text-sm text-blue-700 mb-2">
                      From page {selectionData.pageNumber} of {selectionData.pdfFilename}
                    </p>
                    <blockquote className="text-sm text-blue-800 italic border-l-2 border-blue-300 pl-3">
                      "{selectionData.text}"
                    </blockquote>
                  </div>
                </div>
              </Card>
            )}

            {/* Note Editor */}
            <Card className={cn(
              editorMode === 'normal' && "p-6",
              editorMode === 'fullscreen' && "mx-8 p-6 flex-1",
              editorMode === 'focus' && "border-none shadow-none bg-transparent p-0 flex-1"
            )}>
              {/* Title Input */}
              <div className={cn(
                "mb-6",
                editorMode === 'focus' && "mb-8"
              )}>
                <Input
                  type="text"
                  placeholder="Enter note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={cn(
                    "text-xl font-semibold border-none px-0 focus:ring-0 focus:border-none",
                    editorMode === 'focus' && "text-3xl font-bold"
                  )}
                  style={{ boxShadow: "none" }}
                />
              </div>

              {/* Rich Text Editor */}
              <LazyNotionEditor
                initialContent={content}
                onChange={setContent}
                placeholder="Start writing your note..."
                className={cn(
                  editorMode === 'normal' && "min-h-[400px]",
                  editorMode === 'fullscreen' && "min-h-[500px]",
                  editorMode === 'focus' && "min-h-[600px]"
                )}
                mode={editorMode}
                onModeChange={handleModeChange}
                showModeToggle={false}
                showWordCount={true}
                showReadingTime={true}
              />
            </Card>

            {/* Footer Actions - Only in normal mode */}
            {editorMode === 'normal' && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  {selectionData ? (
                    <span>This note will be linked to your PDF annotation</span>
                  ) : (
                    <span>Use "/" to insert blocks and format text</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !title.trim()}
                    className="flex items-center gap-2"
                  >
                    <Save size={16} />
                    {isSaving ? "Saving..." : "Save Note"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {renderFocusControls()}
        {renderKeyboardHint()}
      </div>
    </ErrorBoundary>
  );
};

export default NewNotePage;