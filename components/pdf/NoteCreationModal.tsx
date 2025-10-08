/*
this component provides a modal dialog for creating a note
*/
import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { X, FileText, Save } from "lucide-react";
import { NotionEditor } from "@/components/editor/NotionEditor";
import { AutoSaveStatusProvider } from "@/components/dashboard/AutoSaveStatusProvider";
import { FloatingAutoSaveStatus } from "@/components/dashboard/FloatingAutoSaveStatus";
import { cn } from "@/lib/utils";
import type { NoteContent } from "@/lib/types/editor";
import type { JSONContent } from "@tiptap/core";

interface NoteCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  pdfTitle?: string;
  onNoteCreated: (noteId: string) => void;
}

export const NoteCreationModal: React.FC<NoteCreationModalProps> = ({
  isOpen,
  onClose,
  selectedText,
  pdfTitle,
  onNoteCreated,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 150); // Small delay for smooth animation
  }, [onClose]);

  const handleNoteCreated = useCallback(
    (noteId: string) => {
      console.log("Note created in modal:", noteId);
      // Don't auto-close the modal when note is created/auto-saved
      // onNoteCreated(noteId);
      // handleClose();

      // Just notify parent about the note creation without closing
      onNoteCreated(noteId);
    },
    [onNoteCreated]
  );

  // Handle manual save button click
  const handleSaveClick = useCallback(() => {
    // For now, we'll create a temporary note ID
    // In a real implementation, this would trigger the editor's save function
    const tempNoteId = `note_${Date.now()}`;
    console.log("Manual save triggered:", tempNoteId);
    // Don't close the modal on manual save either - let user decide when to close
    onNoteCreated(tempNoteId);
    // handleClose(); // Removed - don't auto-close on manual save
  }, [onNoteCreated]);

  return (
    <AutoSaveStatusProvider>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogPortal>
          {/* Custom blur overlay */}
          <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm" />

          <DialogPrimitive.Content
            className={cn(
              "fixed left-[50%] top-[50%] z-[9999] grid w-[90vw] h-[90vh] max-h-[800px] translate-x-[-50%] translate-y-[-50%] border bg-background shadow-lg sm:rounded-lg p-0 overflow-hidden"
            )}
            onPointerDownOutside={(e) => {
              // Allow manual closing by clicking outside
            }}
          >
            <DialogHeader className="p-6 pb-2 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-semibold">
                      Create Note from Selection
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      From: {pdfTitle || "PDF Document"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveClick}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Save Note
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="flex-1 overflow-hidden p-6">
              <div className="h-full bg-background rounded-lg border border-border overflow-hidden">
                <NotionEditor
                  autoFocus={true}
                  autoSave={true}
                  onNoteCreated={handleNoteCreated}
                  className="h-full"
                  placeholder="Add your thoughts about the selected text..."
                />
              </div>
            </div>

            {/* Selected text reference */}
            <div className="p-4 bg-muted/50 border-t border-border">
              <div className="text-xs font-medium text-muted-foreground mb-1">
                Selected Text:
              </div>
              <div className="text-sm text-foreground italic bg-background p-2 rounded border border-border max-h-20 overflow-y-auto">
                "{selectedText}"
              </div>
            </div>

            {/* AutoSave Status - positioned relative to the modal */}
            <FloatingAutoSaveStatus />

            {/* Close button in top right */}
            <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </AutoSaveStatusProvider>
  );
};
