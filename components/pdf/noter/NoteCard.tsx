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
    if (!isDeleting) {
      onDelete(note.id);
    }
  };

  const handleClick = () => {
    if (!isDeleting) {
      onClick(note.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group p-3 border border-border rounded-lg transition-all duration-200 flex items-center gap-3 ${
        isDeleting
          ? "opacity-60 cursor-not-allowed bg-muted/50"
          : "cursor-pointer hover:border-primary/50 hover:bg-accent/50"
      }`}
    >
      <div
        className={`p-2 rounded-md bg-primary/10 text-primary transition-colors flex-shrink-0 ${
          !isDeleting && "group-hover:bg-primary/20"
        }`}
      >
        <FileText className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h3
          className={`font-medium text-sm truncate transition-colors ${
            !isDeleting && "group-hover:text-primary"
          }`}
        >
          {note.title || "Untitled Note"}
        </h3>
        <p className="text-xs text-muted-foreground">
          {isDeleting ? "Deleting..." : `Updated ${formattedDate}`}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        disabled={isDeleting}
        className={`cursor-pointer transition-opacity flex-shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 ${
          isDeleting ? "opacity-50" : "opacity-0 group-hover:opacity-100"
        }`}
        onClick={handleDelete}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
