"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useGetPDFsQuery,
  useUploadPDFMutation,
  useDeletePDFMutation,
  useRenamePDFMutation,
  useGetFoldersQuery,
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useMovePDFMutation,
} from "@/lib/store/apiSlice";
import {
  ErrorType,
  ErrorSeverity,
  AppError,
} from "@/lib/utils/error-handling/errors";
import { PDFDocument, Folder } from "@/lib/types/pdf";
import { PDFUploadZone } from "./PDFUploadZone";
import { PDFContextMenu } from "./PDFContextMenu";
import { FolderContextMenu } from "./FolderContextMenu";
import { PDFBreadcrumb } from "./PDFBreadcrumb";
import { PDFViewToggle } from "./PDFViewToggle";
import { PDFSearchBar } from "./PDFSearchBar";
import { PDFSortOptions } from "./PDFSortOptions";
import { CreateFolder } from "./PDFFolder";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { DraggablePDFItem } from "./DraggablePDFItem";
import { DraggableFolder } from "./DraggableFolder";
import { DragOverlayContent } from "./DragOverlay";
import { TreeView } from "./TreeView";
import { RenameDialog } from "./RenameDialog";
import { FileText, FolderOpen, Upload, GraduationCap } from "lucide-react";
import { Logger } from "@/lib/utils/logger";
import { PDFDirectoryLoadingState } from "./PDFDirectoryLoadingState";
import { GoogleClassroomButton } from "../GoogleClassroomButton";

export type ViewMode = "grid" | "list" | "compact" | "details";
export type SortBy = "name" | "date" | "size" | "type";
export type SortOrder = "asc" | "desc";

interface PDFDirectoryViewProps {
  className?: string;
  onPDFSelect?: (pdf: PDFDocument) => void;
  selectionMode?: boolean;
  selectedPDFs?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function PDFDirectoryView({
  className,
  onPDFSelect,
  selectionMode = false,
  selectedPDFs = [],
  onSelectionChange,
}: PDFDirectoryViewProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<Folder[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>(selectedPDFs);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    pdfId: string;
  } | null>(null);
  const [folderContextMenu, setFolderContextMenu] = useState<{
    x: number;
    y: number;
    folderId: string;
    folderName: string;
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    pdfId: string | null;
  }>({ isOpen: false, pdfId: null });
  const [renameDialog, setRenameDialog] = useState<{
    isOpen: boolean;
    pdfId: string | null;
    currentName: string;
  }>({
    isOpen: false,
    pdfId: null,
    currentName: "",
  });
  const [folderDeleteDialog, setFolderDeleteDialog] = useState<{
    isOpen: boolean;
    folderId: string | null;
  }>({ isOpen: false, folderId: null });
  const [folderRenameDialog, setFolderRenameDialog] = useState<{
    isOpen: boolean;
    folderId: string | null;
    currentName: string;
  }>({
    isOpen: false,
    folderId: null,
    currentName: "",
  });
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // API hooks
  const { data: pdfData, isLoading, error, refetch } = useGetPDFsQuery();
  const {
    data: folderData,
    isLoading: isFoldersLoading,
    error: foldersError,
    refetch: refetchFolders,
  } = useGetFoldersQuery();
  const [uploadPDF, { isLoading: isUploading }] = useUploadPDFMutation();
  const [deletePDF, { isLoading: isDeleting }] = useDeletePDFMutation();
  const [renamePDF, { isLoading: isRenaming }] = useRenamePDFMutation();
  const [createFolderMutation, { isLoading: isCreatingFolderMutation }] =
    useCreateFolderMutation();
  const [updateFolderMutation, { isLoading: isUpdatingFolder }] =
    useUpdateFolderMutation();
  const [deleteFolderMutation, { isLoading: isDeletingFolder }] =
    useDeleteFolderMutation();
  const [movePDFMutation, { isLoading: isMovingPDF }] = useMovePDFMutation();

  // Event listeners for floating sidebar integration
  useEffect(() => {
    const handleUploadTrigger = () => fileInputRef.current?.click();
    const handleFolderCreate = () => setIsCreatingFolder(true);

    window.addEventListener("trigger-pdf-upload", handleUploadTrigger);
    window.addEventListener("trigger-folder-create", handleFolderCreate);

    return () => {
      window.removeEventListener("trigger-pdf-upload", handleUploadTrigger);
      window.removeEventListener("trigger-folder-create", handleFolderCreate);
    };
  }, []);

  const pdfs = pdfData?.pdfs || [];
  const folders = folderData?.folders || [];

  // Filter and sort PDFs
  const filteredAndSortedPDFs = React.useMemo(() => {
    let filtered = pdfs.filter((pdf) => {
      const matchesSearch = pdf.filename
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesFolder = currentFolder
        ? pdf.folderId === currentFolder
        : !pdf.folderId;
      return matchesSearch && matchesFolder;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.filename.localeCompare(b.filename);
          break;
        case "date":
          comparison =
            new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case "size":
          comparison = a.fileSize - b.fileSize;
          break;
        case "type":
          comparison =
            a.filename
              .split(".")
              .pop()
              ?.localeCompare(b.filename.split(".").pop() || "") || 0;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [pdfs, searchQuery, currentFolder, sortBy, sortOrder]);

  // File upload handlers
  const handleFileDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!activeId && e.dataTransfer.types.includes("Files")) {
        setIsDragOver(true);
      }
    },
    [activeId]
  );

  const handleFileDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (!activeId && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        const pdfFiles = files.filter(
          (file) => file.type === "application/pdf"
        );
        if (pdfFiles.length > 0) {
          handleFileUpload(pdfFiles);
        }
      }
    },
    [activeId]
  );

  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolder) {
        formData.append("folderId", currentFolder);
      }

      try {
        await uploadPDF(formData).unwrap();
        // Success notification is handled by RTK Query onQueryStarted
      } catch (error) {
        // Error notification is handled by RTK Query onQueryStarted
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }
  };

  // DnD Kit handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDndDragOver = (_event: DragOverEvent) => {
    // Handle drag over logic if needed
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const draggedPDF = pdfs.find((pdf) => pdf.id === activeId);
    const draggedFolder = folders.find((folder) => folder.id === activeId);
    const targetFolder = folders.find((folder) => folder.id === overId);

    try {
      if (draggedPDF && targetFolder) {
        await movePDFMutation({
          id: activeId,
          folderId: overId,
        }).unwrap();

        toast.success("PDF moved successfully");
        refetch();
        refetchFolders();
      } else if (draggedFolder && targetFolder) {
        await updateFolderMutation({
          id: activeId,
          updates: { parentId: overId },
        }).unwrap();

        toast.success("Folder moved successfully");
        refetchFolders();
      }
    } catch (error) {
      toast.error("Failed to move item");
    }

    setActiveId(null);
  };

  // Folder expansion handlers
  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // Selection handlers
  const handleItemSelect = (pdfId: string, isCtrlClick = false) => {
    if (selectionMode) {
      let newSelection: string[];
      if (isCtrlClick) {
        newSelection = selectedItems.includes(pdfId)
          ? selectedItems.filter((id) => id !== pdfId)
          : [...selectedItems, pdfId];
      } else {
        newSelection =
          selectedItems.includes(pdfId) && selectedItems.length === 1
            ? []
            : [pdfId];
      }
      setSelectedItems(newSelection);
      onSelectionChange?.(newSelection);
    } else {
      const pdf = pdfs.find((p) => p.id === pdfId);
      if (pdf) {
        onPDFSelect?.(pdf);
      }
    }
  };

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, pdfId: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, pdfId });
  };

  const handleFolderContextMenu = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault();
    const folder = folders.find((f) => f.id === folderId);
    setFolderContextMenu({
      x: e.clientX,
      y: e.clientY,
      folderId,
      folderName: folder?.name || "",
    });
  };

  const handleDeletePDF = async (pdfId: string) => {
    try {
      await deletePDF(pdfId).unwrap();
      toast.success("The PDF has been deleted successfully.");
      setDeleteDialog({ isOpen: false, pdfId: null });
    } catch (error) {
      toast.error("Failed to delete the PDF.");
    }
  };

  const handleRenamePDF = async (pdfId: string, newName: string) => {
    try {
      await renamePDF({ id: pdfId, filename: newName }).unwrap();
      toast.success("The PDF has been renamed successfully.");
      setRenameDialog({ isOpen: false, pdfId: null, currentName: "" });
    } catch (error) {
      toast.error("Failed to rename the PDF.");
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      await createFolderMutation({
        name: folderName,
        parentId: currentFolder,
      }).unwrap();

      setIsCreatingFolder(false);
      refetchFolders();
      toast.success(`Folder "${folderName}" has been created successfully.`);
    } catch (error) {
      toast.error("Failed to create folder.");
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolderMutation({ id: folderId }).unwrap();
      toast.success("The folder has been deleted successfully.");
      setFolderDeleteDialog({ isOpen: false, folderId: null });
      refetchFolders();
    } catch (error) {
      console.error("Failed to delete folder:", error);
      toast.error("Failed to delete the folder.");
    }
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
      await updateFolderMutation({
        id: folderId,
        updates: { name: newName },
      }).unwrap();
      toast.success("The folder has been renamed successfully.");
      setFolderRenameDialog({ isOpen: false, folderId: null, currentName: "" });
      refetchFolders();
    } catch (error) {
      toast.error("Failed to rename the folder.");
    }
  };

  const handleCreateSubfolder = (parentId: string) => {
    setCurrentFolder(parentId);
    setIsCreatingFolder(true);
  };

  const handleFolderNavigation = (folderId: string | null) => {
    setCurrentFolder(folderId);

    if (folderId) {
      const folder = folders.find((f) => f.id === folderId);
      if (folder) {
        const path: Folder[] = [folder];
        let currentParent = folder.parent_id;

        while (currentParent) {
          const parentFolder = folders.find((f) => f.id === currentParent);
          if (parentFolder) {
            path.unshift(parentFolder);
            currentParent = parentFolder.parent_id;
          } else {
            break;
          }
        }
        setFolderPath(path);
      }
    } else {
      setFolderPath([]);
    }
  };

  // Helper function to get view mode classes
  const getViewModeClasses = (viewMode: ViewMode): string => {
    switch (viewMode) {
      case "grid":
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4";
      case "list":
        return "space-y-2";
      case "compact":
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2";
      case "details":
        return "space-y-1";
      default:
        return "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4";
    }
  };

  if (isLoading || isFoldersLoading) {
    return <PDFDirectoryLoadingState />;
  }

  if (error || foldersError) {
    const errorToLog = error || foldersError;
    
    // More detailed error logging
    console.error("PDF/Folder Error Details:", {
      hasError: !!error,
      hasFoldersError: !!foldersError,
      error: error,
      foldersError: foldersError,
      errorString: JSON.stringify(error, null, 2),
      foldersErrorString: JSON.stringify(foldersError, null, 2),
    });
    
    Logger.error("Failed to load PDFs or folders", errorToLog);
    
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load PDFs</h3>
        <p className="text-sm text-muted-foreground mb-4">
          There was an error loading your PDF files{foldersError ? ' and folders' : ''}. Please try again.
        </p>
        {/* Show error details in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-left bg-muted p-4 rounded-md mb-4 max-w-2xl overflow-auto">
            <pre>{JSON.stringify(errorToLog, null, 2)}</pre>
          </div>
        )}
        <div className="flex gap-2">
          {error && <Button onClick={() => refetch()}>Retry PDFs</Button>}
          {foldersError && <Button onClick={() => refetchFolders()}>Retry Folders</Button>}
        </div>
      </div>
    );
  }

  const allItems = [
    ...folders.map((f) => f.id),
    ...filteredAndSortedPDFs.map((p) => p.id),
  ];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDndDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={`space-y-4 ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <PDFBreadcrumb
            path={folderPath}
            onNavigate={handleFolderNavigation}
          />
          <div className="flex items-center gap-2">
            <PDFSearchBar value={searchQuery} onChange={setSearchQuery} />
            <PDFSortOptions
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={(by, order) => {
                setSortBy(by);
                setSortOrder(order);
              }}
            />
            <PDFViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreatingFolder(true)}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            <GoogleClassroomButton />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {/* Upload zone */}
        <PDFUploadZone
          onDrop={handleFileDrop}
          onDragOver={handleFileDragOver}
          onDragLeave={handleFileDragLeave}
          isDragOver={isDragOver}
          currentFolder={currentFolder}
        />

        {/* Content area */}
        <div
          className={`min-h-[400px] ${
            isDragOver
              ? "bg-primary/5 border-2 border-dashed border-primary"
              : ""
          }`}
          onDragOver={handleFileDragOver}
          onDragLeave={handleFileDragLeave}
          onDrop={handleFileDrop}
        >
          {filteredAndSortedPDFs.length === 0 &&
          folders.filter((f) => f.parent_id === currentFolder).length === 0 &&
          !isCreatingFolder ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No items found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchQuery
                  ? "No PDFs match your search criteria"
                  : "Upload your first PDF or create a folder to get started"}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsCreatingFolder(true)}
                  variant="outline"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload PDF
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Details view header */}
              {viewMode === "details" && (
                <div className="flex items-center gap-3 p-2 border-b bg-muted/30 rounded-t-lg text-sm font-medium text-muted-foreground">
                  <div className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0 grid grid-cols-4 gap-4">
                    <span>Name</span>
                    <span>Size</span>
                    <span>Type</span>
                    <span>Modified</span>
                  </div>
                  <div className="w-8 h-8 flex-shrink-0" />
                </div>
              )}

              <SortableContext
                items={allItems}
                strategy={verticalListSortingStrategy}
              >
                {viewMode === "list" || viewMode === "details" ? (
                  <TreeView
                    folders={folders}
                    pdfs={filteredAndSortedPDFs}
                    currentFolder={currentFolder}
                    expandedFolders={expandedFolders}
                    viewMode={viewMode}
                    selectedItems={selectedItems}
                    activeId={activeId}
                    isCreatingFolder={isCreatingFolder}
                    onToggleExpansion={toggleFolderExpansion}
                    onFolderNavigation={handleFolderNavigation}
                    onItemSelect={handleItemSelect}
                    onContextMenu={handleContextMenu}
                    onFolderContextMenu={handleFolderContextMenu}
                    onPDFOpen={(pdf) =>
                      router.push(`/dashboard/pdfs/${pdf.id}`)
                    }
                    onCreateFolder={handleCreateFolder}
                    onCancelCreateFolder={() => setIsCreatingFolder(false)}
                  />
                ) : (
                  <div className={getViewModeClasses(viewMode)}>
                    {isCreatingFolder && (
                      <CreateFolder
                        onCreateFolder={handleCreateFolder}
                        onCancel={() => setIsCreatingFolder(false)}
                        viewMode={viewMode}
                      />
                    )}

                    {folders
                      .filter((folder) => folder.parent_id === currentFolder)
                      .map((folder) => (
                        <DraggableFolder
                          key={folder.id}
                          folder={folder}
                          viewMode={viewMode}
                          onOpen={() => handleFolderNavigation(folder.id)}
                          onSelect={() => {}}
                          onContextMenu={(e) =>
                            handleFolderContextMenu(e, folder.id)
                          }
                          isDragging={activeId === folder.id}
                        />
                      ))}

                    {filteredAndSortedPDFs.map((pdf) => (
                      <DraggablePDFItem
                        key={pdf.id}
                        pdf={pdf}
                        viewMode={viewMode}
                        isSelected={selectedItems.includes(pdf.id)}
                        onSelect={(isCtrlClick) =>
                          handleItemSelect(pdf.id, isCtrlClick)
                        }
                        onContextMenu={(e) => handleContextMenu(e, pdf.id)}
                        onOpen={() => router.push(`/dashboard/pdfs/${pdf.id}`)}
                        isDragging={activeId === pdf.id}
                      />
                    ))}
                  </div>
                )}
              </SortableContext>
            </>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
              handleFileUpload(files);
            }
          }}
        />

        {/* Context menu */}
        {contextMenu && (
          <PDFContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            pdfId={contextMenu.pdfId}
            onClose={() => setContextMenu(null)}
            onDelete={(pdfId) => setDeleteDialog({ isOpen: true, pdfId })}
            onRename={(pdfId, currentName) =>
              setRenameDialog({ isOpen: true, pdfId, currentName })
            }
          />
        )}

        {/* Folder context menu */}
        {folderContextMenu && (
          <FolderContextMenu
            x={folderContextMenu.x}
            y={folderContextMenu.y}
            folderId={folderContextMenu.folderId}
            currentName={folderContextMenu.folderName}
            onClose={() => setFolderContextMenu(null)}
            onDelete={(folderId) =>
              setFolderDeleteDialog({ isOpen: true, folderId })
            }
            onRename={(folderId, currentName) =>
              setFolderRenameDialog({ isOpen: true, folderId, currentName })
            }
            onOpen={(folderId) => handleFolderNavigation(folderId)}
            onCreateSubfolder={handleCreateSubfolder}
          />
        )}

        {/* Delete confirmation dialog */}
        <DeleteConfirmationDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, pdfId: null })}
          onConfirm={() =>
            deleteDialog.pdfId && handleDeletePDF(deleteDialog.pdfId)
          }
          noteTitle={
            pdfs.find((p) => p.id === deleteDialog.pdfId)?.filename || "PDF"
          }
          isDeleting={isDeleting}
        />

        {/* Rename dialog */}
        <RenameDialog
          isOpen={renameDialog.isOpen}
          currentName={renameDialog.currentName}
          onClose={() =>
            setRenameDialog({ isOpen: false, pdfId: null, currentName: "" })
          }
          onConfirm={(newName) =>
            renameDialog.pdfId && handleRenamePDF(renameDialog.pdfId, newName)
          }
          isLoading={isRenaming}
        />

        {/* Folder delete confirmation dialog */}
        <DeleteConfirmationDialog
          isOpen={folderDeleteDialog.isOpen}
          onClose={() =>
            setFolderDeleteDialog({ isOpen: false, folderId: null })
          }
          onConfirm={() =>
            folderDeleteDialog.folderId &&
            handleDeleteFolder(folderDeleteDialog.folderId)
          }
          noteTitle={
            folders.find((f) => f.id === folderDeleteDialog.folderId)?.name ||
            "Folder"
          }
          isDeleting={isDeletingFolder}
        />

        {/* Folder rename dialog */}
        <RenameDialog
          isOpen={folderRenameDialog.isOpen}
          currentName={folderRenameDialog.currentName}
          onClose={() =>
            setFolderRenameDialog({
              isOpen: false,
              folderId: null,
              currentName: "",
            })
          }
          onConfirm={(newName) =>
            folderRenameDialog.folderId &&
            handleRenameFolder(folderRenameDialog.folderId, newName)
          }
          isLoading={isUpdatingFolder}
        />

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <DragOverlayContent
              activeId={activeId}
              folders={folders}
              pdfs={pdfs}
            />
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
