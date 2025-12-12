"use client";

import { Folder, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FolderCardProps {
  id: string;
  name: string;
  isSelected: boolean;
  isDraggedOver?: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onOpen: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onOptionsClick: (e: React.MouseEvent) => void;
}

export function FolderCard({
  name,
  isSelected,
  isDraggedOver,
  onSelect,
  onOpen,
  onContextMenu,
  onOptionsClick,
}: FolderCardProps) {
  return (
    <div
      className={`relative group rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-950 border-blue-500"
          : isDraggedOver
          ? "bg-blue-100 dark:bg-blue-900 border-blue-400"
          : "bg-card"
      }`}
      onClick={onSelect}
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
    >
      <div className="flex flex-col items-center gap-2">
        <Folder className="h-12 w-12 text-blue-600" />
        <p className="text-sm text-center truncate w-full" title={name}>
          {name}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onOptionsClick(e);
        }}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
  );
}
