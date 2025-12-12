/**
 * @file useDragAndDrop.ts
 * @description Hook for managing drag-and-drop file and folder movement
 */

"use client";

import { useState } from "react";
import { DragEndEvent, DragStartEvent, DragOverEvent } from "@dnd-kit/core";

export interface DragItem {
  type: "file" | "folder";
  id: string;
  name: string;
}

export function useDragAndDrop() {
  const [activeItem, setActiveItem] = useState<DragItem | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as DragItem;
    setActiveItem(data);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    
    if (over && over.data.current?.type === "folder") {
      setDragOverFolderId(over.id as string);
    } else {
      setDragOverFolderId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent, onMove: (itemType: "file" | "folder", itemId: string, targetFolderId: string | null) => void) => {
    const { active, over } = event;

    setActiveItem(null);
    setDragOverFolderId(null);

    if (!over) return;

    const draggedItem = active.data.current as DragItem;
    const overData = over.data.current;

    // Only allow dropping on folders or empty area (root)
    if (overData?.type === "folder") {
      const targetFolderId = over.id as string;
      
      // Don't move into itself
      if (draggedItem.id === targetFolderId) return;
      
      onMove(draggedItem.type, draggedItem.id, targetFolderId);
    }
  };

  const handleDragCancel = () => {
    setActiveItem(null);
    setDragOverFolderId(null);
  };

  return {
    activeItem,
    dragOverFolderId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
}
