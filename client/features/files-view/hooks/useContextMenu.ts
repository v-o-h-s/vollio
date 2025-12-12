/**
 * @file useContextMenu.ts
 * @description Hook for managing context menu state and positioning
 */

"use client";

import { useState, useCallback } from "react";

export interface ContextMenuState {
  x: number;
  y: number;
  type: "file" | "folder" | "empty";
  itemId?: string;
}

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const openContextMenu = useCallback(
    (e: React.MouseEvent, type: "file" | "folder" | "empty", itemId?: string) => {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        type,
        itemId,
      });
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu,
  };
}
