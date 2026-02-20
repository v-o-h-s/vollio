/**
 * @document DocumentsToolbar.tsx
 * @description Toolbar component for the documents view, including search, view toggle, filters, and classroom access.
 * Built with React and TypeScript.
 */
"use client";

import React from "react";
import { SearchBar } from "./SearchBar";
import { ViewToggle, ViewMode } from "./ViewToggle";
import { Button } from "@/components/ui/button";
import { School, Upload, FolderPlus } from "lucide-react";

interface DocumentsToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  classroomLabel: string;
  onClassroomClick: () => void;
  onUploadClick: () => void;
  onCreateFolderClick: () => void;
}

export function DocumentsToolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  classroomLabel,
  onClassroomClick,
  onUploadClick,
  onCreateFolderClick,
}: DocumentsToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search documents and folders..."
        className="flex-1 max-w-md cursor-pointer"
      />
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onUploadClick}
          className="gap-2 cursor-pointer"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
        <Button
          variant="outline"
          onClick={onCreateFolderClick}
          className="gap-2 cursor-pointer"
        >
          <FolderPlus className="h-4 w-4" />
          New Folder
        </Button>
        <Button
          variant="secondary"
          onClick={onClassroomClick}
          className="gap-2 cursor-pointer"
        >
          <School className="h-4 w-4" />
          {classroomLabel}
        </Button>
        <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
      </div>
    </div>
  );
}
