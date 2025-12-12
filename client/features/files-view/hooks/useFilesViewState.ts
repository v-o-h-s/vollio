"use client";

import { useState, useMemo, useCallback } from "react";
import { ViewMode } from "../components/ViewToggle";
import { FileFilters } from "../components/FilterDropdown";

export interface File {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  folderId: string | null;
  isGoogleDriveFile: boolean;
}

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
}

export type SelectedItem = {
  type: "file" | "folder";
  id: string;
};

export function useFilesViewState(files: File[], folders: Folder[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filters, setFilters] = useState<FileFilters>({
    showPDFs: true,
    showDocs: true,
    showImages: true,
    showGoogleDrive: true,
    showLocal: true,
  });
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Filter files based on search, filters, and current folder
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      // Search filter
      if (searchQuery && !file.filename.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Folder filter
      if (currentFolder ? file.folderId !== currentFolder : file.folderId !== null) {
        return false;
      }

      // File type filters
      const isPDF = file.mimeType === "application/pdf";
      const isDoc = file.mimeType.includes("document") || file.mimeType.includes("word");
      const isImage = file.mimeType.includes("image");

      if (isPDF && !filters.showPDFs) return false;
      if (isDoc && !filters.showDocs) return false;
      if (isImage && !filters.showImages) return false;

      // Source filters
      if (file.isGoogleDriveFile && !filters.showGoogleDrive) return false;
      if (!file.isGoogleDriveFile && !filters.showLocal) return false;

      return true;
    });
  }, [files, searchQuery, filters, currentFolder]);

  // Filter folders based on search and current folder
  const filteredFolders = useMemo(() => {
    return folders.filter((folder) => {
      // Search filter
      if (searchQuery && !folder.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Current folder filter
      return currentFolder ? folder.parent_id === currentFolder : folder.parent_id === null;
    });
  }, [folders, searchQuery, currentFolder]);

  // Selection management
  const isItemSelected = useCallback(
    (type: "file" | "folder", id: string) => {
      return selectedItems.some((item) => item.type === type && item.id === id);
    },
    [selectedItems]
  );

  const toggleItemSelection = useCallback(
    (type: "file" | "folder", id: string, multiSelect = false) => {
      setSelectedItems((prev) => {
        const isSelected = prev.some((item) => item.type === type && item.id === id);
        
        if (multiSelect) {
          // Multi-select: toggle the item
          if (isSelected) {
            return prev.filter((item) => !(item.type === type && item.id === id));
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
    []
  );

  const selectRange = useCallback(
    (type: "file" | "folder", fromId: string, toId: string) => {
      const items = type === "file" ? filteredFiles : filteredFolders;
      const fromIndex = items.findIndex((item) => item.id === fromId);
      const toIndex = items.findIndex((item) => item.id === toId);
      
      if (fromIndex === -1 || toIndex === -1) return;
      
      const start = Math.min(fromIndex, toIndex);
      const end = Math.max(fromIndex, toIndex);
      const rangeItems = items.slice(start, end + 1).map((item) => ({ type, id: item.id }));
      
      setSelectedItems((prev) => {
        // Remove duplicates and merge with existing selection
        const newItems = [...prev, ...rangeItems];
        return newItems.filter((item, index, self) => 
          index === self.findIndex((t) => t.type === item.type && t.id === item.id)
        );
      });
    },
    [filteredFiles, filteredFolders]
  );

  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  const selectAll = useCallback(() => {
    const allItems: SelectedItem[] = [
      ...filteredFolders.map((folder) => ({ type: "folder" as const, id: folder.id })),
      ...filteredFiles.map((file) => ({ type: "file" as const, id: file.id })),
    ];
    setSelectedItems(allItems);
  }, [filteredFiles, filteredFolders]);

  return {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    currentFolder,
    setCurrentFolder,
    filteredFiles,
    filteredFolders,
    selectedItems,
    isItemSelected,
    toggleItemSelection,
    selectRange,
    clearSelection,
    selectAll,
  };
}
