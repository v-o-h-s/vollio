"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PDFFolder } from "./PDFFolder";
import { ViewMode } from "./PDFDirectoryView";
import { Folder } from "@/lib/types/pdf";

interface DraggableFolderProps {
  folder: Folder;
  viewMode: ViewMode;
  onOpen: () => void;
  onSelect: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  isDragging?: boolean;
}

export function DraggableFolder({
  folder,
  viewMode,
  onOpen,
  onSelect,
  onContextMenu,
  isDragging = false,
}: DraggableFolderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: folder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <PDFFolder
        folder={folder}
        viewMode={viewMode}
        onOpen={onOpen}
        onSelect={onSelect}
        onContextMenu={onContextMenu}
        isDragging={isDragging}
        dragHandleProps={listeners}
      />
    </div>
  );
}