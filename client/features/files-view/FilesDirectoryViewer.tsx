/**
 * @file FilesDirectoryViewer.tsx
 * @description A React component that displays a directory viewer for files,
 * allowing users to navigate through folders and view files in a structured manner.
 * It integrates with the application's state management to fetch and display
 * folders and files, and provides a user-friendly interface for file management.
 */

"use client";

import { useGetAllFilesQuery, useGetAllFoldersQuery } from "@/lib/store/apiSlice";
import { FilesToolbar } from "./components/FilesToolbar";
import { useFilesViewState } from "./hooks/useFilesViewState";
import { Loader2 } from "lucide-react";
import { RTKQueryError } from "@/lib/error-handling/rtk-query-error";

export default function FilesDirectoryViewer() {
  // Fetch data from API
  const {
    data: filesData,
    isLoading: isLoadingFiles,
    error: filesError,
    refetch: refetchFiles,
  } = useGetAllFilesQuery();

  const {
    data: foldersData,
    isLoading: isLoadingFolders,
    error: foldersError,
    refetch: refetchFolders,
  } = useGetAllFoldersQuery();



  // Local state management with custom hook
  const {
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
  } = useFilesViewState(filesData || [], foldersData?.folders || []);

  // Loading state
  if (isLoadingFiles || isLoadingFolders) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state - Display complete server error response
  if (filesError || foldersError) {
    return (
      <RTKQueryError
        error={filesError || foldersError}
        errorName={filesError ? 'Files Error' : 'Folders Error'}
        onRetry={() => {
          refetchFiles();
          refetchFolders();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar with search, view toggle, filter, and classroom button */}
      <FilesToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Files and folders content */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          {/* Content will be implemented based on view mode */}
          <div className="text-center text-muted-foreground">
            <p>Found {filteredFiles.length} files and {filteredFolders.length} folders</p>
            <p className="text-sm mt-2">View mode: {viewMode}</p>
          </div>
        </div>
      </div>
    </div>
  );
}