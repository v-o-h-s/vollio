"use client";

import React, { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ErrorNotification } from "@/components/ui/error-notification";
import toast from "react-hot-toast";
import {
  useGetPDFsQuery,
  useDeletePDFMutation,
  useRenamePDFMutation,
} from "@/lib/store/apiSlice";
import { ErrorType, ErrorSeverity, AppError } from "@/lib/types/errors";
import { PDFUploadZone } from "./PDFUploadZone";
import { PDFContextMenu } from "./PDFContextMenu";
import { PDFBreadcrumb } from "./PDFBreadcrumb";
import { PDFViewToggle } from "./PDFViewToggle";
import { PDFSearchBar } from "./PDFSearchBar";
import { PDFSortOptions } from "./PDFSortOptions";
import { PDFFolder, CreateFolder } from "./PDFFolder";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import {
  FileText,
  FolderOpen,
  Grid3X3,
  List,
  Upload,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  Share,
  Star,
  Clock,
  Calendar,
} from "lucide-react";
import { safeFormatDistanceToNow } from "@/lib/utils/dates";
import { PDFDocument } from "@/lib/types/pdf";
interface PDFDirectoryViewProps {
  className?: string;
  onPDFSelect?: (pdf: PDFDocument) => void;
  selectionMode?: boolean;
  selectedPDFs?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export type ViewMode = "grid" | "list" | "compact" | "details";
export type SortBy = "name" | "date" | "size" | "type";
export type SortOrder = "asc" | "desc";

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  pdfCount: number;
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
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [draggedItem, setDraggedItem] = useState<{
    type: "pdf" | "folder";
    id: string;
  } | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // API hooks
  const { data: pdfData, isLoading, error, refetch } = useGetPDFsQuery();
  const [deletePDF, { isLoading: isDeleting }] = useDeletePDFMutation();
  const [renamePDF, { isLoading: isRenaming }] = useRenamePDFMutation();

  const pdfs = pdfData?.pdfs || [];

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

    // Sort PDFs
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.filename.localeCompare(b.filename);
          break;
        case "date":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
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

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");

    if (pdfFiles.length > 0) {
      // Handle file upload
      handleFileUpload(pdfFiles);
    }
  }, []);

  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      if (currentFolder) {
        formData.append("folderId", currentFolder);
      }

      try {
        const response = await fetch("/api/pdfs/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        toast.success(`${file.name} has been uploaded successfully.`);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}.`);
      }
    }

    refetch();
  };

  // Drag and drop handlers for moving files/folders
  const handleDragStart = (
    e: React.DragEvent,
    type: "pdf" | "folder",
    id: string
  ) => {
    setDraggedItem({ type, id });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropTarget(null);
  };

  const handleDragEnterFolder = (folderId: string) => {
    if (draggedItem && draggedItem.id !== folderId) {
      setDropTarget(folderId);
    }
  };

  const handleDragLeaveFolder = () => {
    setDropTarget(null);
  };

  const handleDropOnFolder = async (targetFolderId: string) => {
    if (!draggedItem) return;

    try {
      if (draggedItem.type === "pdf") {
        // Move PDF to folder
        const response = await fetch(`/api/pdfs/${draggedItem.id}/move`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId: targetFolderId }),
        });

        if (!response.ok) throw new Error("Failed to move PDF");

        toast.success("PDF moved successfully");
        refetch();
      } else if (draggedItem.type === "folder") {
        // Move folder (update parent)
        setFolders((prev) =>
          prev.map((folder) =>
            folder.id === draggedItem.id
              ? { ...folder, parentId: targetFolderId }
              : folder
          )
        );
        toast.success("Folder moved successfully");
      }
    } catch (error) {
      toast.error("Failed to move item");
    }

    setDraggedItem(null);
    setDropTarget(null);
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
      // In a real implementation, this would call an API
      const newFolder: Folder = {
        id: `folder-${Date.now()}`,
        name: folderName,
        parentId: currentFolder,
        createdAt: new Date().toISOString(),
        pdfCount: 0,
      };

      setFolders((prev) => [...prev, newFolder]);
      setIsCreatingFolder(false);
      toast.success(`Folder "${folderName}" has been created successfully.`);
    } catch (error) {
      toast.error("Failed to create folder.");
    }
  };

  const handleFolderNavigation = (folderId: string | null) => {
    setCurrentFolder(folderId);

    // Update folder path for breadcrumb
    if (folderId) {
      const folder = folders.find((f) => f.id === folderId);
      if (folder) {
        // Build path by traversing up the folder hierarchy
        const path: Folder[] = [folder];
        let currentParent = folder.parentId;

        while (currentParent) {
          const parentFolder = folders.find((f) => f.id === currentParent);
          if (parentFolder) {
            path.unshift(parentFolder);
            currentParent = parentFolder.parentId;
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
  if (isLoading) {
    return <PDFDirectoryViewSkeleton />;
  }

  if (error) {
    const appError: AppError = {
      type: ErrorType.DATABASE_ERROR,
      message: "Unable to fetch your PDF documents. Please try again.",
      severity: ErrorSeverity.MEDIUM,
      retryable: true,
      userMessage: "Failed to load PDFs",
      timestamp: new Date(),
      context: {
        component: "PDFDirectoryView",
        action: "fetch_pdfs",
      },
    };

    return <ErrorNotification error={appError} onRetry={refetch} />;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with breadcrumb and actions */}
      <div className="flex items-center justify-between">
        <PDFBreadcrumb path={folderPath} onNavigate={handleFolderNavigation} />

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
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        isDragOver={isDragOver}
        currentFolder={currentFolder}
      />

      {/* Content area */}
      <div
        className={`min-h-[400px] ${
          isDragOver ? "bg-primary/5 border-2 border-dashed border-primary" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {filteredAndSortedPDFs.length === 0 &&
        folders.filter((f) => f.parentId === currentFolder).length === 0 &&
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

            <div className={getViewModeClasses(viewMode)}>
              {/* Folder creation */}
              {isCreatingFolder && (
                <CreateFolder
                  onCreateFolder={handleCreateFolder}
                  onCancel={() => setIsCreatingFolder(false)}
                  viewMode={viewMode}
                />
              )}

              {/* Folders */}
              {folders
                .filter((folder) => folder.parentId === currentFolder)
                .map((folder) => (
                  <PDFFolder
                    key={folder.id}
                    folder={folder}
                    viewMode={viewMode}
                    onOpen={() => handleFolderNavigation(folder.id)}
                    onSelect={() => {}} // TODO: Implement folder selection
                    onDragStart={(e) => handleDragStart(e, "folder", folder.id)}
                    onDragEnd={handleDragEnd}
                    onDragEnter={() => handleDragEnterFolder(folder.id)}
                    onDragLeave={handleDragLeaveFolder}
                    onDrop={() => handleDropOnFolder(folder.id)}
                    isDropTarget={dropTarget === folder.id}
                    isDragging={draggedItem?.id === folder.id}
                  />
                ))}

              {/* PDFs */}
              {filteredAndSortedPDFs.map((pdf) => (
                <PDFItem
                  key={pdf.id}
                  pdf={pdf}
                  viewMode={viewMode}
                  isSelected={selectedItems.includes(pdf.id)}
                  onSelect={(isCtrlClick) =>
                    handleItemSelect(pdf.id, isCtrlClick)
                  }
                  onContextMenu={(e) => handleContextMenu(e, pdf.id)}
                  onOpen={() => router.push(`/dashboard/pdfs/${pdf.id}`)}
                  onDragStart={(e) => handleDragStart(e, "pdf", pdf.id)}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedItem?.id === pdf.id}
                />
              ))}
            </div>
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

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, pdfId: null })}
        onConfirm={() =>
          deleteDialog.pdfId && handleDeletePDF(deleteDialog.pdfId)
        }
        title="Delete PDF"
        description="Are you sure you want to delete this PDF? This action cannot be undone."
        isLoading={isDeleting}
      />

      {/* Rename dialog */}
      {renameDialog.isOpen && (
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
      )}
    </div>
  );
}

// Helper function to get view mode classes
function getViewModeClasses(viewMode: ViewMode): string {
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
}

// PDF Item Component
interface PDFItemProps {
  pdf: PDFDocument;
  viewMode: ViewMode;
  isSelected: boolean;
  onSelect: (isCtrlClick: boolean) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onOpen: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

function PDFItem({
  pdf,
  viewMode,
  isSelected,
  onSelect,
  onContextMenu,
  onOpen,
  onDragStart,
  onDragEnd,
  isDragging = false,
}: PDFItemProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toUpperCase() || "PDF";
  };

  if (viewMode === "grid") {
    return (
      <Card
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? "ring-2 ring-primary" : ""
        } ${isDragging ? "opacity-50" : ""}`}
        onClick={(e) => onSelect(e.ctrlKey || e.metaKey)}
        onContextMenu={onContextMenu}
        onDoubleClick={onOpen}
      >
        <CardContent className="p-4">
          <div className="aspect-square mb-3 bg-muted rounded-lg flex flex-col items-center justify-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-2" />
            <Badge variant="secondary" className="text-xs">
              {getFileExtension(pdf.filename)}
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-sm truncate" title={pdf.filename}>
              {pdf.filename}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatFileSize(pdf.fileSize)}</span>
              <span>{safeFormatDistanceToNow(pdf.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === "compact") {
    return (
      <div
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={`p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
          isSelected ? "bg-primary/10" : ""
        } ${isDragging ? "opacity-50" : ""}`}
        onClick={(e) => onSelect(e.ctrlKey || e.metaKey)}
        onContextMenu={onContextMenu}
        onDoubleClick={onOpen}
      >
        <div className="flex flex-col items-center text-center">
          <FileText className="h-8 w-8 text-muted-foreground mb-1" />
          <p
            className="text-xs font-medium truncate w-full"
            title={pdf.filename}
          >
            {pdf.filename}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(pdf.fileSize)}
          </p>
        </div>
      </div>
    );
  }

  if (viewMode === "details") {
    return (
      <div
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
          isSelected ? "bg-primary/10" : ""
        } ${isDragging ? "opacity-50" : ""}`}
        onClick={(e) => onSelect(e.ctrlKey || e.metaKey)}
        onContextMenu={onContextMenu}
        onDoubleClick={onOpen}
      >
        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0 grid grid-cols-4 gap-4">
          <p className="font-medium truncate">{pdf.filename}</p>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(pdf.fileSize)}
          </p>
          <p className="text-sm text-muted-foreground">
            {getFileExtension(pdf.filename)}
          </p>
          <p className="text-sm text-muted-foreground">
            {safeFormatDistanceToNow(pdf.createdAt)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onContextMenu(e);
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Default list view
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
        isSelected ? "bg-primary/10" : ""
      } ${isDragging ? "opacity-50" : ""}`}
      onClick={(e) => onSelect(e.ctrlKey || e.metaKey)}
      onContextMenu={onContextMenu}
      onDoubleClick={onOpen}
    >
      <div className="w-10 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{pdf.filename}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{formatFileSize(pdf.fileSize)}</span>
          <span>{safeFormatDistanceToNow(pdf.createdAt)}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onContextMenu(e);
        }}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Rename Dialog Component
interface RenameDialogProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  isLoading: boolean;
}

function RenameDialog({
  isOpen,
  currentName,
  onClose,
  onConfirm,
  isLoading,
}: RenameDialogProps) {
  const [newName, setNewName] = useState(currentName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newName !== currentName) {
      onConfirm(newName.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Rename PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new name"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading || !newName.trim() || newName === currentName
                }
              >
                {isLoading ? "Renaming..." : "Rename"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading skeleton
function PDFDirectoryViewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 w-32 bg-muted rounded animate-pulse" />
          <div className="h-9 w-24 bg-muted rounded animate-pulse" />
          <div className="h-9 w-20 bg-muted rounded animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="aspect-[3/4] mb-3 bg-muted rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
