/*
this component provides a modal dialog for creating a note
*/
import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, FileText, Save } from 'lucide-react';
import { NotionEditor } from '@/components/editor/NotionEditor';
import type { JSONContent, NoteContent } from '@/lib/types';

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

  // Prepare initial content with selected text as context
  const initialContent: NoteContent = {
    title: 'Untitled Note',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Note' }]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              marks: [{ type: 'bold' }],
              text: 'Selected Text: '
            },
            {
              type: 'text',
              marks: [{ type: 'italic' }],
              text: `"${selectedText}"`
            }
          ]
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              marks: [{ type: 'bold' }],
              text: 'From: '
            },
            {
              type: 'text',
              text: pdfTitle || 'PDF Document'
            }
          ]
        },
        {
          type: 'paragraph',
          content: []
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Add your notes here...'
            }
          ]
        }
      ]
    }
  };

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 150); // Small delay for smooth animation
  }, [onClose]);

  const handleNoteCreated = useCallback((noteId: string) => {
    console.log('Note created in modal:', noteId);
    onNoteCreated(noteId);
    handleClose();
  }, [onNoteCreated, handleClose]);

  // Handle manual save button click
  const handleSaveClick = useCallback(() => {
    // For now, we'll create a temporary note ID
    // In a real implementation, this would trigger the editor's save function
    const tempNoteId = `note_${Date.now()}`;
    console.log('Manual save triggered:', tempNoteId);
    onNoteCreated(tempNoteId);
    handleClose();
  }, [onNoteCreated, handleClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className=" w-[90vw] h-[90vh] max-h-[800px] p-0 overflow-hidden">
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
                  From: {pdfTitle || 'PDF Document'}
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
              content={initialContent}
              autoFocus={true}
              autoSave={false}
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
      </DialogContent>
    </Dialog>
  );
};
