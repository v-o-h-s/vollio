import { useGetNoteQuery } from "@/lib/store/apiSlice";
import { LoadingState } from "@/components/ui/loading";
import { NotionEditor } from "@/components/editor";
import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoteEditorTabProps {
  noteId: string;
  fileId: string;
  isActive: boolean;
  onTitleChange?: (noteId: string, newTitle: string) => void;
}

/**
 * A persistent editor instance for a single note tab.
 * The editor remains mounted when hidden, preserving undo/redo history and cursor position.
 */
export function NoteEditorTab({
  noteId,
  fileId,
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
    <div className="h-full flex flex-col">
      <div className="px-8 py-2 border-b border-border flex items-center justify-between bg-background/50 backdrop-blur-sm sticky top-0 z-10">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Currently Editing
        </h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-muted-foreground hover:text-primary transition-colors"
          onClick={() =>
            window.open(`/dashboard/notes/${noteData.id}`, "_blank")
          }
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="text-xs">Open Full Editor</span>
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-8 pt-4">
        <NotionEditor
          noteId={noteData.id}
          content={{
            title: noteData.title,
            content: noteData.content,
          }}
          fileId={fileId}
          autoSave={isActive} // Only auto-save when this tab is active
          autoSaveDelay={500}
          lastUpdatedAt={noteData.updatedAt}
        />
      </div>
    </div>
  );
}
