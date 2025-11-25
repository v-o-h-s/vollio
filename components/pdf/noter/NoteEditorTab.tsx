import { useGetNoteQuery } from "@/lib/store/apiSlice";
import { LoadingState } from "@/components/ui/loading";
import { NotionEditor } from "@/components/editor";

interface NoteEditorTabProps {
  noteId: string;
  pdfId: string;
  isActive: boolean;
}

/**
 * A persistent editor instance for a single note tab.
 * The editor remains mounted when hidden, preserving undo/redo history and cursor position.
 */
export function NoteEditorTab({ noteId, pdfId, isActive }: NoteEditorTabProps) {
  const { data: noteData, error, isLoading } = useGetNoteQuery(noteId);

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
          pdfId={pdfId}
          autoSave={isActive} // Only auto-save when this tab is active
          autoSaveDelay={500}
        />
      </div>
    </div>
  );
}
