import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { X } from "lucide-react";

type NoteTabProps = {
  id: string;
  label: string | number;
  onDelete: (id: string) => void;
};

export default function NoteTab({ id, label, onDelete }: NoteTabProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style: CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, 0, 0)`
      : undefined,
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
    id={id}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center min-w-[110px] h-8 bg-background flex-row justify-center text-sm border border-border  rounded-lg
                 hover:bg-primary/10 text-foreground hover:text-primary cursor-pointer transition-all duration-150
                 font-medium "
    >
      <span className="truncate">Note Tab {label}</span>
      <div
        role="button"
        tabIndex={0}
        className="ml-2 p-0.5 rounded-full hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors"
        onPointerDown={(e) => {
          e.stopPropagation();
          onDelete(id);
        }}
      >
        <X className="w-3 h-3" />
      </div>
    </div>
  );
}
