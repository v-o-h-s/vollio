import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, X, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGetNoteQuery } from '@/lib/store/apiSlice';
import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Heading } from '@tiptap/extension-heading';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';

interface NotePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string | null;
}

export const NotePreviewModal: React.FC<NotePreviewModalProps> = ({
  isOpen,
  onClose,
  noteId,
}) => {
  const router = useRouter();
  
  const { data: note, isLoading, error } = useGetNoteQuery(noteId || '', {
    skip: !noteId,
  });

  // Read-only editor for preview
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading,
      Bold,
      Italic,
    ],
    content: note?.content || null,
    editable: false,
    immediatelyRender: false,
  });

  // Update editor content when note data changes
  React.useEffect(() => {
    if (editor && note?.content) {
      editor.commands.setContent(note.content);
    }
  }, [editor, note?.content]);

  const handleOpenInNotesPage = () => {
    if (noteId) {
      router.push(`/dashboard/notes/${noteId}`);
      onClose();
    }
  };

  if (!noteId) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[90vw] max-h-[70vh] overflow-hidden">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {note?.title || 'Note Preview'}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {note?.createdAt && new Date(note.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNotesPage}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {!!error && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Failed to load note</p>
            </div>
          )}

          {note && editor && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <EditorContent 
                editor={editor} 
                className="focus:outline-none min-h-[200px]"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
