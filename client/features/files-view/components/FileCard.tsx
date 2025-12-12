"use client";

import { FileText, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileCardProps {
  id: string;
  filename: string;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onOpen: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onOptionsClick: (e: React.MouseEvent) => void;
}

export function FileCard({
  filename,
  isSelected,
  onSelect,
  onOpen,
  onContextMenu,
  onOptionsClick,
}: FileCardProps) {
  return (
    <div
      className={`relative group rounded-lg flex flex-col justify-center  h-[140px] w-[140px] cursor-pointer transition-all hover:shadow-md hover:bg-muted/5 rounded-2xl ${
        isSelected ? "bg-blue-50 dark:bg-blue-950 border-blue-500" : ""
      }`}
      onClick={onSelect}
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
    >
      <div className="flex flex-col items-center gap-2 ">
        <FileText className="h-14 w-14 group-hover:text-primary transition-colors" />
        <p className="text-sm text-center font-bold truncate w-full" title={filename}>
          {filename}
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
