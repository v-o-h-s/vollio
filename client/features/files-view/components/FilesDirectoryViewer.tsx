/**
 * @file FilesDirectoryViewer.tsx
 * @description A React component that displays a directory viewer for files,
 * allowing users to navigate through folders and view files in a structured manner.
 * It integrates with the application's state management to fetch and display
 * folders and files, and provides a user-friendly interface for file management.
 */

"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { FilesToolbar } from "./FilesToolbar";
import { Breadcrumb } from "./Breadcrumb";
import { GridView } from "./views/GridView";
import { ListView } from "./views/ListView";
import { CompactView } from "./views/CompactView";
import { DetailsView } from "./views/DetailsView";
import { CreateFolderDialog } from "./dialogs/CreateFolderDialog";
import { ClassroomImportDialog } from "./dialogs/ClassroomImportDialog";
import { ContextMenu } from "./ContextMenu";
import { useFilesViewState } from "../hooks/useFilesViewState";
import { useBreadcrumbNavigation } from "../hooks/useBreadcrumbNavigation";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useFolder } from "../hooks/useFolder";
import { useFile } from "../hooks/useFile";
import { useFileExplorerShortcuts } from "../hooks/useFileExplorerShortcuts";
import { Loader2, FolderOpen, FileText, FolderPlus, Upload, Trash2 } from "lucide-react";
import { RTKQueryError } from "@/lib/error-handling/rtk-query-error";
import { useGetGoogleClassroomConnectionStatusQuery } from "@/lib/store/apiSlice";

export default function FilesDirectoryViewer() {
  // Use custom hooks for data management
  const {
    folders,
    isLoading: isLoadingFolders,
    error: foldersError,
    refetch: refetchFolders,
    createFolder,
  } = useFolder();
  const {
    files,
    isLoading: isLoadingFiles,
    error: filesError,
    refetch: refetchFiles,
    moveFile,
    openFile,
    uploadFile,
    isUploading,
  } = useFile();

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
    selectedItems,
    isItemSelected,
    toggleItemSelection,
    clearSelection,
    selectAll,
  } = useFilesViewState(files, folders);

  // Breadcrumb navigation
  const { breadcrumbPath } = useBreadcrumbNavigation({
    currentFolder,
    folders,
  });

  // Drag and drop
  const {
    activeItem,
    dragOverFolderId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop();

  // Dialog states
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [classroomDialogOpen, setClassroomDialogOpen] = useState(false);

  // Classroom status (connection-level)
  const { data: classroomStatus, isLoading: isClassroomChecking } = useGetGoogleClassroomConnectionStatusQuery();
  const classroomLabel = isClassroomChecking
    ? "Checking..."
    : classroomStatus?.data?.isConnected
      ? "Add from Classroom"
      : "Connect Classroom";
  // Keyboard shortcuts
  useFileExplorerShortcuts({
    onSelectAll: selectAll,
    onDelete: () => {
      // Bulk delete will be handled here if needed
      // Individual deletes are handled at component level
    },
    onClearSelection: clearSelection,
    onEscape: clearSelection,
    enabled: !createFolderDialogOpen,
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handlers
  const handleItemSelect = (type: "file" | "folder", id: string, e: React.MouseEvent) => {
    const isMultiSelect = e.ctrlKey || e.metaKey;
    toggleItemSelection(type, id, isMultiSelect);
  };

  const handleFolderOpen = (folderId: string) => {
    setCurrentFolder(folderId);
    clearSelection();
  };

  const handleFileOpen = (fileId: string) => {
    openFile(fileId);
  };

  const handleBreadcrumbNavigate = (folderId: string | null) => {
    setCurrentFolder(folderId);
    clearSelection();
  };

  const handleCreateFolder = async (name: string) => {
    await createFolder(name, currentFolder);
  };

  const handleDragEndWithMove = (event: any) => {
    handleDragEnd(event, async (itemType, itemId, targetFolderId) => {
      if (targetFolderId) {
        const cleanTargetFolderId = targetFolderId.replace(/^folder-/, "");
        console.log("moving ", itemType, " from ", itemId, " to ", cleanTargetFolderId)
        await moveFile(itemId, cleanTargetFolderId);
        await Promise.all([refetchFiles(), refetchFolders()]);
      }
    });
  };

  // File drag and drop upload handlers
  const handleFileDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingFile(true);
    }
  };

  const handleFileDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide if leaving the main container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDraggingFile(false);
    }
  };

  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    for (const file of files) {
      const result = await uploadFile(file, currentFolder);
      if (result.error) {
        console.error("Failed to upload file:", file.name);
      }
    }

    refetchFiles();
  };

  // Render view based on viewMode
  const renderView = () => {
    const viewProps = {
      folders: filteredFolders,
      files: filteredFiles,
      isItemSelected,
      onItemSelect: handleItemSelect,
      onFolderOpen: handleFolderOpen,
      onFileOpen: handleFileOpen,
      onEmptyAreaClick: clearSelection,
      dragOverFolderId,
      allFolders: folders,
    };

    switch (viewMode) {
      case "grid":
        return <GridView {...viewProps} />;
      case "list":
        return <ListView {...viewProps} />;
      case "compact":
        return <CompactView {...viewProps} />;
      case "details":
        return <DetailsView {...viewProps} />;
      default:
        return <GridView {...viewProps} />;
    }
  };

  // Loading state
  if (isLoadingFiles || isLoadingFolders) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (filesError || foldersError) {
    return (
      <RTKQueryError
        error={filesError || foldersError}
        errorName={filesError ? "Files Error" : "Folders Error"}
        onRetry={() => {
          refetchFiles();
          refetchFolders();
        }}
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEndWithMove}
      onDragCancel={handleDragCancel}
    >
      <div className="space-y-4 flex flex-col ">
        {/* Toolbar with search, view toggle, filter, and classroom button */}
        <FilesToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filters={filters}
          onFiltersChange={setFilters}
          classroomLabel={classroomLabel}
          onClassroomClick={() => setClassroomDialogOpen(true)}
        />

        {/* Breadcrumb Navigation */}
        <Breadcrumb path={breadcrumbPath} onNavigate={handleBreadcrumbNavigate} />

        {/* Files and folders content with drag-drop upload */}
        <div
          className="rounded-lg overflow-hidden relative"
          onDragEnter={handleFileDragEnter}
          onDragLeave={handleFileDragLeave}
          onDragOver={handleFileDragOver}
          onDrop={handleFileDrop}
        >
          {renderView()}

          {/* Drag overlay - Full screen popup for upload only*/}
          {isDraggingFile && (
            <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-[100]">
              <div className="max-w-md w-full mx-4 bg-card border-2 border-dashed border-primary rounded-2xl p-12 shadow-2xl">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                    <Upload className="h-20 w-20 text-primary mx-auto relative animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">Drop your files here</h3>
                    <p className="text-sm text-muted-foreground">
                      {currentFolder
                        ? "Files will be uploaded to the current folder"
                        : "Files will be uploaded to the root directory"}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">Multiple files supported</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload indicator */}
          {isUploading && (
            <div className="fixed bottom-4 right-4 bg-card border rounded-lg p-4 shadow-lg z-50 min-w-[200px]">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Uploading files...</p>
                  <p className="text-xs text-muted-foreground">Please wait</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <CreateFolderDialog
        open={createFolderDialogOpen}
        onOpenChange={setCreateFolderDialogOpen}
        onSubmit={handleCreateFolder}
        parentFolderId={currentFolder}
      />

      <ClassroomImportDialog
        open={classroomDialogOpen}
        onOpenChange={setClassroomDialogOpen}
        onImported={refetchFiles}
      />

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem && (
          <div className=" flex flex-col justify-center items-center    rounded-lg shadow-lg w-[140px] opacity-90">
            <div >
              <div className="aspect-square  w-[90px] h-[90px] rounded-lg flex flex-col items-center justify-center  ">
                {activeItem.type === "folder" ? (
                  <FolderOpen className="h-12 w-12 text-white" />
                ) : (
                  <FileText className="h-12 w-12 text-white" />
                )}
              </div>
              <p className="text-sm font-medium text-center truncate">{activeItem.name}</p>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}