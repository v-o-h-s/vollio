/**
 * @file FilesToolbar.tsx
 * @description Toolbar component for the files view, including search, view toggle, filters, and classroom access.
 * Built with React and TypeScript.
 */
"use client";

import React from "react";
import { SearchBar } from "./SearchBar";
import { ViewToggle, ViewMode } from "./ViewToggle";
import { FilterDropdown, FileFilters } from "./FilterDropdown";
import { Button } from "@/components/ui/button";
import { School, Upload, FolderPlus } from "lucide-react";

interface FilesToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: FileFilters;
  onFiltersChange: (filters: FileFilters) => void;
  classroomLabel: string;
  onClassroomClick: () => void;
  onUploadClick: () => void;
  onCreateFolderClick: () => void;
}

export function FilesToolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  classroomLabel,
  onClassroomClick,
  onUploadClick,
  onCreateFolderClick,
}: FilesToolbarProps) {
  return (
    <div className="flex items-center gap-3">
      <SearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search files and folders..."
        className="flex-1 max-w-md"
      />
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onUploadClick} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload File
        </Button>
        <Button
          variant="outline"
          onClick={onCreateFolderClick}
          className="gap-2"
        >
          <FolderPlus className="h-4 w-4" />
          New Folder
        </Button>
        <Button variant="default" onClick={onClassroomClick} className="gap-2">
          <School className="h-4 w-4" />
          {classroomLabel}
        </Button>
        <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
        <FilterDropdown filters={filters} onFiltersChange={onFiltersChange} />
      </div>
    </div>
  );
}
