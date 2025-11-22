import { PDFDocument } from "@/lib/types/pdf";
import NotesTabsManager, { Tab } from "./NotesTabsManager";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Noter({ pdfDocument }: { pdfDocument: PDFDocument }) {
  const [notes, setNotes] = useState<Tab[]>([]);

  const handleCreateNote = () => {
    const newNote = {
      id: `note-${Date.now()}`,
      label: `${notes.length + 1}`,
    };
    setNotes([...notes, newNote]);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  if (notes.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-4 text-center p-4">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">No notes yet</h3>
          <p className="text-sm text-muted-foreground">
            Create your first note to start annotating this document.
          </p>
        </div>
        <Button onClick={handleCreateNote}>
          <Plus className="w-4 h-4 mr-2" />
          Create Note
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <NotesTabsManager
        tabs={notes}
        onReorder={setNotes}
        onDeleteNote={handleDeleteNote}
        onAddNote={handleCreateNote}
      />
      <div className="mt-12 p-4">
        {/* Placeholder for note content */}
        <p className="text-muted-foreground text-sm">
          Select a note to view content
        </p>
      </div>
    </div>
  );
}
