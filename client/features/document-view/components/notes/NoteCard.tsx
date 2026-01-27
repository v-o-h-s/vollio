import { formatDistanceToNow } from "date-fns";
import { FileText, Trash2, ExternalLink } from "lucide-react";
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

  const handleOpenInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`/notes/${note.id}`, "_blank");
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
          : "cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5"
      }`}
    >
      <div
        className={`p-2 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 transition-colors shrink-0 ${
          !isDeleting && "group-hover:bg-indigo-500/20"
        }`}
      >
        <FileText className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h3
          className={`font-medium text-sm truncate transition-colors ${
            !isDeleting && "group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
          }`}
        >
          {note.title || "Untitled Note"}
        </h3>
        <p className="text-xs text-muted-foreground">
          {isDeleting ? "Deleting..." : `Updated ${formattedDate}`}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          disabled={isDeleting}
          className={`cursor-pointer transition-opacity shrink-0 h-8 w-8 text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 ${
            isDeleting ? "opacity-50" : "opacity-0 group-hover:opacity-100"
          }`}
          onClick={handleOpenInNewTab}
          title="Open in new window"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          disabled={isDeleting}
          className={`cursor-pointer transition-opacity shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 ${
            isDeleting ? "opacity-50" : "opacity-0 group-hover:opacity-100"
          }`}
          onClick={handleDelete}
          title="Delete note"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
