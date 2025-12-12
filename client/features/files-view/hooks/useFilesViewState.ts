"use client";

import { useState, useMemo } from "react";
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
  };
}
