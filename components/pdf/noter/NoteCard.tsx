import { formatDistanceToNow } from "date-fns";
import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoteCardProps {
  note: {
    id: string;
    title: string;
    updatedAt: string;
  };
  onClick: (noteId: string) => void;
  onDelete: (noteId: string) => void;
  isDeleting: boolean;
}

export const NoteCard = ({
  note,
  onClick,
  onDelete,
  isDeleting,
}: NoteCardProps) => {
  const formattedDate = formatDistanceToNow(new Date(note.updatedAt), {
    addSuffix: true,
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(note.id);
  };

  return (
    <div
      onClick={() => onClick(note.id)}
      className="group cursor-pointer p-3 border border-border rounded-lg hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 flex items-center gap-3"
    >
      <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors flex-shrink-0">
        <FileText className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
          {note.title || "Untitled Note"}
        </h3>
        <p className="text-xs text-muted-foreground">Updated {formattedDate}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleDelete}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
