import { useGetNoteQuery } from "@/lib/store/apiSlice";
import { LoadingState } from "@/components/ui/loading";
import { NotionEditor } from "@/components/editor";
import { useEffect } from "react";

interface NoteEditorTabProps {
  noteId: string;
  documentId: string;
  isActive: boolean;
  onTitleChange?: (noteId: string, newTitle: string) => void;
}

/**
 * A persistent editor instance for a single note tab.
 * The editor remains mounted when hidden, preserving undo/redo history and cursor position.
 */
export function NoteEditorTab({
  noteId,
  documentId,
  isActive,
  onTitleChange,
}: NoteEditorTabProps) {
  const { data: noteData, error, isLoading } = useGetNoteQuery(noteId);

  // Update tab label when note title changes
  useEffect(() => {
    if (noteData && onTitleChange) {
      onTitleChange(noteId, noteData.title);
    }
  }, [noteData?.title, noteId, onTitleChange]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingState title="Loading note..." description="Please wait..." />
      </div>
    );
  }

  if (error || !noteData) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-destructive">Failed to load note</p>
      </div>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="flex-1 h-full">
        <NotionEditor
          noteId={noteData.id}
          content={{
            title: noteData.title,
            content: noteData.content,
          }}
          documentId={documentId}
          autoSave={isActive}
          autoSaveDelay={500}
        />
      </div>
    </div>
  );
}
