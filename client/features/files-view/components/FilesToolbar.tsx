"use client";

import React from "react";
import { SearchBar } from "./SearchBar";
import { ViewToggle, ViewMode } from "./ViewToggle";
import { FilterDropdown, FileFilters } from "./FilterDropdown";

interface FilesToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: FileFilters;
  onFiltersChange: (filters: FileFilters) => void;
}

export function FilesToolbar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
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
        <ViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
        <FilterDropdown filters={filters} onFiltersChange={onFiltersChange} />
      </div>
    </div>
  );
}
