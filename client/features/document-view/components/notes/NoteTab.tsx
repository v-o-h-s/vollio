import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { X, Home } from "lucide-react";
import { LuNotebookPen } from "react-icons/lu";

type NoteTabProps = {
  id: string;
  label: string | number;
  isActive: boolean;
  isHome?: boolean;
  onDelete: (id: string) => void;
  onClick: (id: string) => void;
};

export default function NoteTab({
  id,
  label,
  isActive,
  isHome,
  onDelete,
  onClick,
}: NoteTabProps) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id, disabled: isHome }); // Disable dragging for home tab

  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, 0, 0)` : undefined,
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const displayLabel = isHome
    ? null
    : typeof label === "string"
    ? label
    : `Note ${label}`;

  return (
    <div
      id={id}
      ref={setNodeRef}
      style={style}
      {...(isHome ? {} : listeners)} // Only add drag listeners if not home tab
      {...(isHome ? {} : attributes)}
      onClick={() => onClick(id)}
      title={isHome ? "Home" : displayLabel || undefined}
      className={`flex items-center ${
        isHome ? "min-w-[40px] px-2" : "min-w-[110px] max-w-[180px] px-3"
      } h-8 flex-row justify-center text-sm border rounded-lg
                 hover:bg-indigo-500/10 cursor-pointer transition-all duration-150 font-medium
                 ${
                   isActive
                     ? "bg-indigo-500/20 border-indigo-500 text-indigo-600 dark:text-indigo-400"
                     : "bg-background border-border text-foreground hover:text-indigo-600 dark:hover:text-indigo-400"
                 }`}
    >
      {isHome ? (
        <LuNotebookPen className="w-4 h-4" />
      ) : (
        <span className="truncate">{displayLabel}</span>
      )}
      {!isHome && (
        <div
          role="button"
          tabIndex={0}
          className="ml-2 p-0.5 rounded-full hover:bg-background/50 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          onPointerDown={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
        >
          <X className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
