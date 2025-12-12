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
import { useFilesViewState } from "../hooks/useFilesViewState";
import { useBreadcrumbNavigation } from "../hooks/useBreadcrumbNavigation";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useFolder } from "../hooks/useFolder";
import { useFile } from "../hooks/useFile";
import { useFileExplorerShortcuts } from "../hooks/useFileExplorerShortcuts";
import { Loader2, FolderOpen, FileText, FolderPlus, Upload } from "lucide-react";
import { RTKQueryError } from "@/lib/error-handling/rtk-query-error";
import { toast } from "react-hot-toast";

export default function FilesDirectoryViewer() {
  // Use custom hooks for data management
  const {
    folders,
    isLoading: isLoadingFolders,
    error: foldersError,
    refetch: refetchFolders,
    createFolder,
    renameFolder,
    moveFolder,
    deleteFolder,
  } = useFolder();

  const {
    files,
    isLoading: isLoadingFiles,
    error: filesError,
    refetch: refetchFiles,
    renameFile,
    moveFile,
    deleteFile,
    openFile,
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
      if (itemType === "file") {
        await moveFile(itemId, targetFolderId);
      } else {
        await moveFolder(itemId, targetFolderId);
      }
    });
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
        />

        {/* Breadcrumb Navigation */}
        <Breadcrumb path={breadcrumbPath} onNavigate={handleBreadcrumbNavigate} />

        {/* Files and folders content */}
        <div
          className="rounded-lg  overflow-hidden"
          onContextMenu={(e) => {
            e.preventDefault();
            toast("Right-click  on items for more options");
          }}
        >
          {renderView()}
        </div>
      </div>

      {/* Dialogs */}
      <CreateFolderDialog
        open={createFolderDialogOpen}
        onOpenChange={setCreateFolderDialogOpen}
        onSubmit={handleCreateFolder}
        parentFolderId={currentFolder}
      />

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem && (
          <div className="bg-card border-2 border-primary rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2">
              {activeItem.type === "folder" ? (
                <FolderOpen className="h-5 w-5 text-blue-600" />
              ) : (
                <FileText className="h-5 w-5 text-gray-600" />
              )}
              <span className="text-sm font-medium">{activeItem.name}</span>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}