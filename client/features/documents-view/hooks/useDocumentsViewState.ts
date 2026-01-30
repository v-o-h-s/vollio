"use client";

import { useState, useMemo, useCallback } from "react";
import { ViewMode } from "../components/ViewToggle";

export interface Document {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  folderId: string | null;
  isGoogleDriveDocument: boolean;
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
}

export type SelectedItem = {
  type: "document" | "folder";
  id: string;
};

export function useDocumentsViewState(
  documents: Document[],
  folders: Folder[],
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Filter documents based on search and current folder
  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      // Search filter
      if (
        searchQuery &&
        !document.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Folder filter
      if (
        currentFolder
          ? document.folderId !== currentFolder
          : document.folderId !== null
      ) {
        return false;
      }
      return true;
    });
  }, [documents, searchQuery, currentFolder]);

  // Filter folders based on search and current folder
  const filteredFolders = useMemo(() => {
    return folders.filter((folder) => {
      // Search filter
      if (
        searchQuery &&
        !folder.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Current folder filter
      return currentFolder
        ? folder.parent_id === currentFolder
        : folder.parent_id === null;
    });
  }, [folders, searchQuery, currentFolder]);

  // Selection management
  const isItemSelected = useCallback(
    (type: "document" | "folder", id: string) => {
      return selectedItems.some((item) => item.type === type && item.id === id);
    },
    [selectedItems],
  );

  const toggleItemSelection = useCallback(
    (type: "document" | "folder", id: string, multiSelect = false) => {
      setSelectedItems((prev) => {
        const isSelected = prev.some(
          (item) => item.type === type && item.id === id,
        );

        if (multiSelect) {
          // Multi-select: toggle the item
          if (isSelected) {
            return prev.filter(
              (item) => !(item.type === type && item.id === id),
            );
          } else {
            return [...prev, { type, id }];
          }
        } else {
          // Single select: replace selection
          if (isSelected && prev.length === 1) {
            return []; // Deselect if it's the only selected item
          }
          return [{ type, id }];
        }
      });
    },
    [],
  );

  const selectRange = useCallback(
    (type: "document" | "folder", fromId: string, toId: string) => {
      const items = type === "document" ? filteredDocuments : filteredFolders;
      const fromIndex = items.findIndex((item) => item.id === fromId);
      const toIndex = items.findIndex((item) => item.id === toId);

      if (fromIndex === -1 || toIndex === -1) return;

      const start = Math.min(fromIndex, toIndex);
      const end = Math.max(fromIndex, toIndex);
      const rangeItems = items
        .slice(start, end + 1)
        .map((item) => ({ type, id: item.id }));

      setSelectedItems((prev) => {
        // Remove duplicates and merge with existing selection
        const newItems = [...prev, ...rangeItems];
        return newItems.filter(
          (item, index, self) =>
            index ===
            self.findIndex((t) => t.type === item.type && t.id === item.id),
        );
      });
    },
    [filteredDocuments, filteredFolders],
  );

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const selectAll = useCallback(() => {
    const allItems: SelectedItem[] = [
      ...filteredFolders.map((folder) => ({
        type: "folder" as const,
        id: folder.id,
      })),
      ...filteredDocuments.map((document) => ({
        type: "document" as const,
        id: document.id,
      })),
    ];
    setSelectedItems(allItems);
  }, [filteredDocuments, filteredFolders]);

  return {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    currentFolder,
    setCurrentFolder,
    filteredDocuments,
    filteredFolders,
    selectedItems,
    isItemSelected,
    toggleItemSelection,
    selectRange,
    clearSelection,
    selectAll,
  };
}
