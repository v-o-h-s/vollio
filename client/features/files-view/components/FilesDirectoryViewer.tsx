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
  useGetAllFilesQuery,
  useGetAllFoldersQuery,
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useRenameFileMutation,
  useMoveFileMutation,
  useDeleteFileMutation,
} from "@/lib/store/apiSlice";
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
import { ContextMenu, ContextMenuSection } from "./ContextMenu";
import { GridView } from "./views/GridView";
import { ListView } from "./views/ListView";
import { CompactView } from "./views/CompactView";
import { DetailsView } from "./views/DetailsView";
import { CreateFolderDialog } from "./dialogs/CreateFolderDialog";
import { RenameDialog } from "./dialogs/RenameDialog";
import { MoveItemDialog } from "./dialogs/MoveItemDialog";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { useFilesViewState } from "../hooks/useFilesViewState";
import { useBreadcrumbNavigation } from "../hooks/useBreadcrumbNavigation";
import { useContextMenu } from "../hooks/useContextMenu";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { Loader2, FolderOpen, FileText, FolderPlus, Upload, Edit, Trash2, MoveRight } from "lucide-react";
import { RTKQueryError } from "@/lib/error-handling/rtk-query-error";
import { toast } from "react-hot-toast";

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

  // Mutations
  const [createFolder] = useCreateFolderMutation();
  const [updateFolder] = useUpdateFolderMutation();
  const [deleteFolder] = useDeleteFolderMutation();
  const [renameFile] = useRenameFileMutation();
  const [moveFile] = useMoveFileMutation();
  const [deleteFile] = useDeleteFileMutation();

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
  } = useFilesViewState(filesData || [], foldersData?.folders || []);

  // Breadcrumb navigation
  const { breadcrumbPath } = useBreadcrumbNavigation({
    currentFolder,
    folders: foldersData?.folders || [],
  });

  // Context menu
  const { contextMenu, openContextMenu, closeContextMenu } = useContextMenu();

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
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogContext, setDialogContext] = useState<{
    type: "file" | "folder";
    id: string;
    name: string;
  } | null>(null);



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
    const file = filesData?.find((f) => f.id === fileId);
    if (file) {
      // TODO: Implement file opening logic
      toast(`Opening file: ${file.filename}`);
    }
  };

  const handleBreadcrumbNavigate = (folderId: string | null) => {
    setCurrentFolder(folderId);
    clearSelection();
  };

  const handleContextMenuOpen = (
    type: "file" | "folder" | "empty",
    id: string | undefined,
    e: React.MouseEvent
  ) => {
    openContextMenu(e, type, id);
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await createFolder({
        name,
        parentId: currentFolder,
      }).unwrap();
      toast.success("Folder created successfully");
    } catch (error) {
      toast.error("Failed to create folder");
      throw error;
    }
  };

  const handleRename = async (newName: string) => {
    if (!dialogContext) return;

    try {
      if (dialogContext.type === "folder") {
        await updateFolder({
          id: dialogContext.id,
          name: newName,
        }).unwrap();
        toast.success("Folder renamed successfully");
      } else {
        await renameFile({
          id: dialogContext.id,
          name: newName,
        }).unwrap();
        toast.success("File renamed successfully");
      }
    } catch (error) {
      toast.error(`Failed to rename ${dialogContext.type}`);
      throw error;
    }
  };

  const handleMove = async (targetFolderId: string | null) => {
    if (!dialogContext) return;

    try {
      if (dialogContext.type === "file") {
        await moveFile({
          id: dialogContext.id,
          folderId: targetFolderId,
        }).unwrap();
        toast.success("File moved successfully");
      } else {
        await updateFolder({
          id: dialogContext.id,
          parentId: targetFolderId,
        }).unwrap();
        toast.success("Folder moved successfully");
      }
    } catch (error) {
      toast.error(`Failed to move ${dialogContext.type}`);
      throw error;
    }
  };

  const handleDelete = async () => {
    if (selectedItems.length === 0 && !dialogContext) return;

    try {
      const itemsToDelete = dialogContext
        ? [{ type: dialogContext.type, id: dialogContext.id }]
        : selectedItems;

      for (const item of itemsToDelete) {
        if (item.type === "folder") {
          await deleteFolder({ id: item.id, cascade: true }).unwrap();
        } else {
          await deleteFile(item.id).unwrap();
        }
      }

      toast.success(
        `Deleted ${itemsToDelete.length} ${itemsToDelete.length === 1 ? "item" : "items"}`
      );
      clearSelection();
    } catch (error) {
      toast.error("Failed to delete items");
      throw error;
    }
  };

  const handleDragEndWithMove = (event: any) => {
    handleDragEnd(event, async (itemType, itemId, targetFolderId) => {
      try {
        if (itemType === "file") {
          await moveFile({
            id: itemId,
            folderId: targetFolderId,
          }).unwrap();
          toast.success("File moved successfully");
        } else {
          await updateFolder({
            id: itemId,
            parentId: targetFolderId,
          }).unwrap();
          toast.success("Folder moved successfully");
        }
      } catch (error) {
        toast.error(`Failed to move ${itemType}`);
      }
    });
  };

  // Context menu sections
  const getContextMenuSections = (): ContextMenuSection[] => {
    if (!contextMenu) return [];

    if (contextMenu.type === "empty") {
      return [
        {
          actions: [
            {
              label: "New Folder",
              icon: <FolderPlus className="h-4 w-4" />,
              onClick: () => setCreateFolderDialogOpen(true),
            },
            {
              label: "Upload Files",
              icon: <Upload className="h-4 w-4" />,
              onClick: () => toast("Upload functionality coming soon"),
            },
          ],
        },
      ];
    }

    if (contextMenu.type === "folder" && contextMenu.itemId) {
      const folder = foldersData?.folders.find((f) => f.id === contextMenu.itemId);
      if (!folder) return [];

      return [
        {
          actions: [
            {
              label: "Open",
              icon: <FolderOpen className="h-4 w-4" />,
              onClick: () => handleFolderOpen(contextMenu.itemId!),
            },
          ],
        },
        {
          actions: [
            {
              label: "Rename",
              icon: <Edit className="h-4 w-4" />,
              onClick: () => {
                setDialogContext({ type: "folder", id: folder.id, name: folder.name });
                setRenameDialogOpen(true);
              },
            },
            {
              label: "Move",
              icon: <MoveRight className="h-4 w-4" />,
              onClick: () => {
                setDialogContext({ type: "folder", id: folder.id, name: folder.name });
                setMoveDialogOpen(true);
              },
            },
          ],
        },
        {
          actions: [
            {
              label: "Delete",
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => {
                setDialogContext({ type: "folder", id: folder.id, name: folder.name });
                setDeleteDialogOpen(true);
              },
              variant: "destructive",
            },
          ],
        },
      ];
    }

    if (contextMenu.type === "file" && contextMenu.itemId) {
      const file = filesData?.find((f) => f.id === contextMenu.itemId);
      if (!file) return [];

      return [
        {
          actions: [
            {
              label: "Open",
              icon: <FileText className="h-4 w-4" />,
              onClick: () => handleFileOpen(contextMenu.itemId!),
            },
          ],
        },
        {
          actions: [
            {
              label: "Rename",
              icon: <Edit className="h-4 w-4" />,
              onClick: () => {
                setDialogContext({ type: "file", id: file.id, name: file.filename });
                setRenameDialogOpen(true);
              },
            },
            {
              label: "Move",
              icon: <MoveRight className="h-4 w-4" />,
              onClick: () => {
                setDialogContext({ type: "file", id: file.id, name: file.filename });
                setMoveDialogOpen(true);
              },
            },
          ],
        },
        {
          actions: [
            {
              label: "Delete",
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => {
                setDialogContext({ type: "file", id: file.id, name: file.filename });
                setDeleteDialogOpen(true);
              },
              variant: "destructive",
            },
          ],
        },
      ];
    }

    return [];
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
      onContextMenu: (type: "file" | "folder", id: string, e: React.MouseEvent) =>
        handleContextMenuOpen(type, id, e),
      onOptionsClick: (type: "file" | "folder", id: string, e: React.MouseEvent) =>
        handleContextMenuOpen(type, id, e),
      onEmptyAreaClick: () => {
        clearSelection();
      },
      dragOverFolderId,
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
          onContextMenu={(e) => handleContextMenuOpen("empty", undefined, e)}
        >
          {renderView()}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          sections={getContextMenuSections()}
          onClose={closeContextMenu}
        />
      )}

      {/* Dialogs */}
      <CreateFolderDialog
        open={createFolderDialogOpen}
        onOpenChange={setCreateFolderDialogOpen}
        onSubmit={handleCreateFolder}
        parentFolderId={currentFolder}
      />

      {dialogContext && (
        <>
          <RenameDialog
            open={renameDialogOpen}
            onOpenChange={setRenameDialogOpen}
            onSubmit={handleRename}
            currentName={dialogContext.name}
            type={dialogContext.type}
          />

          <MoveItemDialog
            open={moveDialogOpen}
            onOpenChange={setMoveDialogOpen}
            onSubmit={handleMove}
            folders={foldersData?.folders || []}
            currentFolderId={
              dialogContext.type === "file"
                ? filesData?.find((f) => f.id === dialogContext.id)?.folderId
                : foldersData?.folders.find((f) => f.id === dialogContext.id)?.parent_id
            }
            itemType={dialogContext.type}
            itemName={dialogContext.name}
          />

          <DeleteConfirmationDialog
            isOpen={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleDelete}
            noteTitle={dialogContext.name}
          />
        </>
      )}

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