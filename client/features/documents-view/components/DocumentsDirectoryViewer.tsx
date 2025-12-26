/**
 * @document DocumentsDirectoryViewer.tsx
 * @description A React component that displays a directory viewer for documents,
 * allowing users to navigate through folders and view documents in a structured manner.
 * It integrates with the application's state management to fetch and display
 * folders and documents, and provides a user-friendly interface for document management.
 */

"use client";

import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { DocumentsToolbar } from "./DocumentsToolbar";
import { Breadcrumb } from "./Breadcrumb";
import { GridView } from "./views/GridView";
import { ListView } from "./views/ListView";
import { CompactView } from "./views/CompactView";
import { DetailsView } from "./views/DetailsView";
import { CreateFolderDialog } from "./dialogs/CreateFolderDialog";
import { ClassroomImportDialog } from "./dialogs/ClassroomImportDialog";
import { ContextMenu } from "./ContextMenu";
import { useDocumentsViewState } from "../hooks/useDocumentsViewState";
import { useBreadcrumbNavigation } from "../hooks/useBreadcrumbNavigation";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useFolder } from "../hooks/useFolder";
import { useDocument } from "../hooks/useDocument";
import { useDocumentExplorerShortcuts } from "../hooks/useDocumentExplorerShortcuts";
import {
  Loader2,
  FolderOpen,
  FileText,
  FolderPlus,
  Upload,
  Trash2,
} from "lucide-react";
import { RTKQueryError } from "@/lib/error-handling/rtk-query-error";
import { useGetGoogleClassroomConnectionStatusQuery } from "@/lib/store/apiSlice";

export default function DocumentsDirectoryViewer() {
  // Use custom hooks for data management
  const {
    folders,
    isLoading: isLoadingFolders,
    error: foldersError,
    refetch: refetchFolders,
    createFolder,
  } = useFolder();
  const {
    documents,
    isLoading: isLoadingDocuments,
    error: documentsError,
    refetch: refetchDocuments,
    moveDocument,
    openDocument,
    uploadDocument,
    isUploading,
  } = useDocument();

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
    filteredDocuments,
    filteredFolders,
    selectedItems,
    isItemSelected,
    toggleItemSelection,
    clearSelection,
    selectAll,
  } = useDocumentsViewState(documents, folders);

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
  const [isDraggingDocument, setIsDraggingDocument] = useState(false);
  const [classroomDialogOpen, setClassroomDialogOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Classroom status (connection-level)
  const { data: classroomStatus, isLoading: isClassroomChecking } =
    useGetGoogleClassroomConnectionStatusQuery();
  const classroomLabel = isClassroomChecking
    ? "Checking..."
    : classroomStatus?.data?.isConnected
    ? "Add from Classroom"
    : "Connect Classroom";
  // Keyboard shortcuts
  useDocumentExplorerShortcuts({
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

  const documentInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleUploadClick = () => {
    documentInputRef.current?.click();
  };

  const handleDocumentInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const document of files) {
      try {
        await toast.promise(uploadDocument(document, currentFolder), {
          pending: `Uploading ${document.name}...`,
          success: `Successfully uploaded ${document.name}`,
          error: `Failed to upload ${document.name}`,
        });
      } catch (error) {
        console.error("Failed to upload document:", document.name, error);
      }
    }

    // Clear the input so the same document can be uploaded again if needed
    if (documentInputRef.current) {
      documentInputRef.current.value = "";
    }

    refetchDocuments();
  };

  const handleItemSelect = (
    type: "document" | "folder",
    id: string,
    e: React.MouseEvent
  ) => {
    const isMultiSelect = e.ctrlKey || e.metaKey;
    toggleItemSelection(type, id, isMultiSelect);
  };

  const handleFolderOpen = (folderId: string) => {
    setCurrentFolder(folderId);
    clearSelection();
  };

  const handleDocumentOpen = (documentId: string) => {
    openDocument(documentId);
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
        console.log(
          "moving ",
          itemType,
          " from ",
          itemId,
          " to ",
          cleanTargetFolderId
        );
        await moveDocument(itemId, cleanTargetFolderId);
        await Promise.all([refetchDocuments(), refetchFolders()]);
      }
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Document drag and drop upload handlers
  const handleDocumentDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingDocument(true);
    }
  };

  const handleDocumentDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only hide if leaving the main container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDraggingDocument(false);
    }
  };

  const handleDocumentDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDocumentDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingDocument(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    for (const document of files) {
      try {
        await toast.promise(uploadDocument(document, currentFolder), {
          pending: `Uploading ${document.name}...`,
          success: `Successfully uploaded ${document.name}`,
          error: `Failed to upload ${document.name}`,
        });
      } catch (error) {
        console.error("Failed to upload document:", document.name, error);
      }
    }

    refetchDocuments();
  };

  // Render view based on viewMode
  const renderView = () => {
    const viewProps = {
      folders: filteredFolders,
      documents: filteredDocuments,
      isItemSelected,
      onItemSelect: handleItemSelect,
      onFolderOpen: handleFolderOpen,
      onDocumentOpen: handleDocumentOpen,
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
  if (isLoadingDocuments || isLoadingFolders) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (documentsError || foldersError) {
    return (
      <RTKQueryError
        error={documentsError || foldersError}
        errorName={documentsError ? "Documents Error" : "Folders Error"}
        onRetry={() => {
          refetchDocuments();
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
      <div className="flex flex-col h-[700px] overflow-hidden rounded-xl p-4 ">
        {/* Hidden Document Input */}
        <input
          type="file"
          ref={documentInputRef}
          className="hidden"
          multiple
          onChange={handleDocumentInputChange}
        />

        {/* Toolbar with search, view toggle, filter, and classroom button */}
        <div className="flex-none pb-4">
          <DocumentsToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            filters={filters}
            onFiltersChange={setFilters}
            classroomLabel={classroomLabel}
            onClassroomClick={() => setClassroomDialogOpen(true)}
            onUploadClick={handleUploadClick}
            onCreateFolderClick={() => setCreateFolderDialogOpen(true)}
          />
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex-none pb-2">
          <Breadcrumb
            path={breadcrumbPath}
            onNavigate={handleBreadcrumbNavigate}
          />
        </div>

        {/* Documents and folders content with drag-drop upload */}
        <div
          className="flex-1 rounded-lg overflow-hidden relative"
          onDragEnter={handleDocumentDragEnter}
          onDragLeave={handleDocumentDragLeave}
          onDragOver={handleDocumentDragOver}
          onDrop={handleDocumentDrop}
          onContextMenu={handleContextMenu}
        >
          {renderView()}

          {/* Drag overlay - Full screen popup for upload only*/}
          {isDraggingDocument && (
            <div className="fixed  inset-0 bg-background/95  backdrop-blur-sm flex items-center justify-center z-100">
              <div className="max-w-md w-full mx-4 bg-card border-2 border-dashed border-primary rounded-2xl p-12 shadow-2xl">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                    <Upload className="h-20 w-20 text-primary mx-auto relative animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">
                      Drop your documents here
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentFolder
                        ? "Documents will be uploaded to the current folder"
                        : "Documents will be uploaded to the root directory"}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Multiple documents supported
                    </p>
                  </div>
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
        onImported={refetchDocuments}
      />

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem && (
          <div className=" flex flex-col justify-center items-center    rounded-lg shadow-lg w-[140px] opacity-90">
            <div className="w-full px-2">
              <div className="aspect-square  w-[90px] h-[90px] rounded-lg flex flex-col items-center justify-center mx-auto ">
                {activeItem.type === "folder" ? (
                  <FolderOpen className="h-12 w-12 text-white" />
                ) : (
                  <FileText className="h-12 w-12 text-white" />
                )}
              </div>
              <p
                className="text-sm font-medium text-center line-clamp-2 wrap-break-word w-full mt-2"
                title={activeItem.name}
              >
                {activeItem.name}
              </p>
            </div>
          </div>
        )}
      </DragOverlay>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          sections={[
            {
              actions: [
                {
                  label: "Create Document",
                  icon: <FileText className="h-4 w-4" />,
                  onClick: () => {
                    // Document creation will be handled through a dialog in future
                    console.log("Create document clicked");
                  },
                },
                {
                  label: "Create Folder",
                  icon: <FolderPlus className="h-4 w-4" />,
                  onClick: () => {
                    setCreateFolderDialogOpen(true);
                  },
                },
              ],
            },
          ]}
        />
      )}
    </DndContext>
  );
}
