"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  FileText, 
  FolderOpen, 
  MoreVertical, 
  ChevronRight, 
  ChevronDown 
} from "lucide-react";
import { safeFormatDistanceToNow } from "@/lib/utils/dates";
import { PDFDocument } from "@/lib/types/pdf";
import { CreateFolder } from "./PDFFolder";
import { ViewMode } from "./PDFDirectoryView";

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  pdfCount: number;
}

interface TreeViewProps {
  folders: Folder[];
  pdfs: PDFDocument[];
  currentFolder: string | null;
  expandedFolders: Set<string>;
  viewMode: ViewMode;
  selectedItems: string[];
  activeId: string | null;
  isCreatingFolder: boolean;
  onToggleExpansion: (folderId: string) => void;
  onFolderNavigation: (folderId: string | null) => void;
  onItemSelect: (id: string, isCtrlClick?: boolean) => void;
  onContextMenu: (e: React.MouseEvent, pdfId: string) => void;
  onPDFOpen: (pdf: PDFDocument) => void;
  onCreateFolder: (name: string) => void;
  onCancelCreateFolder: () => void;
}

export function TreeView({
  folders,
  pdfs,
  currentFolder,
  expandedFolders,
  viewMode,
  selectedItems,
  activeId,
  isCreatingFolder,
  onToggleExpansion,
  onFolderNavigation,
  onItemSelect,
  onContextMenu,
  onPDFOpen,
  onCreateFolder,
  onCancelCreateFolder,
}: TreeViewProps) {
  const renderTreeNode = (
    folder: Folder,
    level: number = 0
  ): React.ReactNode => {
    const isExpanded = expandedFolders.has(folder.id);
    const childFolders = folders.filter((f) => f.parentId === folder.id);
    const folderPDFs = pdfs.filter((pdf) => pdf.folderId === folder.id);
    const hasChildren = childFolders.length > 0 || folderPDFs.length > 0;

    return (
      <div key={folder.id}>
        {/* Folder row */}
        <TreeNodeFolder
          folder={folder}
          level={level}
          isExpanded={isExpanded}
          hasChildren={hasChildren}
          viewMode={viewMode}
          isSelected={selectedItems.includes(folder.id)}
          isDragging={activeId === folder.id}
          onToggleExpansion={() => onToggleExpansion(folder.id)}
          onOpen={() => onFolderNavigation(folder.id)}
          onSelect={() => onItemSelect(folder.id)}
        />

        {/* Children (if expanded) */}
        {isExpanded && (
          <div>
            {/* Child folders */}
            {childFolders.map((childFolder) =>
              renderTreeNode(childFolder, level + 1)
            )}

            {/* PDFs in this folder */}
            {folderPDFs.map((pdf) => (
              <TreeNodePDF
                key={pdf.id}
                pdf={pdf}
                level={level + 1}
                viewMode={viewMode}
                isSelected={selectedItems.includes(pdf.id)}
                isDragging={activeId === pdf.id}
                onSelect={(isCtrlClick) => onItemSelect(pdf.id, isCtrlClick)}
                onContextMenu={(e) => onContextMenu(e, pdf.id)}
                onOpen={() => onPDFOpen(pdf)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const rootFolders = folders.filter((f) => f.parentId === currentFolder);
  const rootPDFs = pdfs.filter((pdf) => 
    currentFolder ? pdf.folderId === currentFolder : !pdf.folderId
  );

  return (
    <div className="space-y-1">
      {/* Folder creation at root level */}
      {isCreatingFolder && currentFolder === null && (
        <CreateFolder
          onCreateFolder={onCreateFolder}
          onCancel={onCancelCreateFolder}
          viewMode={viewMode}
        />
      )}

      {/* Root level folders */}
      {rootFolders.map((folder) => renderTreeNode(folder, 0))}

      {/* Root level PDFs */}
      {rootPDFs.map((pdf) => (
        <TreeNodePDF
          key={pdf.id}
          pdf={pdf}
          level={0}
          viewMode={viewMode}
          isSelected={selectedItems.includes(pdf.id)}
          isDragging={activeId === pdf.id}
          onSelect={(isCtrlClick) => onItemSelect(pdf.id, isCtrlClick)}
          onContextMenu={(e) => onContextMenu(e, pdf.id)}
          onOpen={() => onPDFOpen(pdf)}
        />
      ))}
    </div>
  );
}

// Tree node components
interface TreeNodeFolderProps {
  folder: Folder;
  level: number;
  isExpanded: boolean;
  hasChildren: boolean;
  viewMode: ViewMode;
  isSelected: boolean;
  isDragging: boolean;
  onToggleExpansion: () => void;
  onOpen: () => void;
  onSelect: () => void;
}

function TreeNodeFolder({
  folder,
  level,
  isExpanded,
  hasChildren,
  viewMode,
  isSelected,
  isDragging,
  onToggleExpansion,
  onOpen,
  onSelect,
}: TreeNodeFolderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: folder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const paddingLeft = level * 20;

  if (viewMode === "details") {
    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <div
          {...listeners}
          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
            isSelected ? "bg-primary/10" : ""
          } ${isDragging ? "opacity-50" : ""}`}
          style={{ paddingLeft: `${paddingLeft + 8}px` }}
          onClick={onSelect}
          onDoubleClick={onOpen}
        >
          <div className="flex items-center gap-1">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpansion();
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
            <FolderOpen className="h-5 w-5 text-primary flex-shrink-0" />
          </div>
          <div className="flex-1 min-w-0 grid grid-cols-4 gap-4">
            <p className="font-medium truncate">{folder.name}</p>
            <p className="text-sm text-muted-foreground">{folder.pdfCount} PDFs</p>
            <p className="text-sm text-muted-foreground">Folder</p>
            <p className="text-sm text-muted-foreground">
              {safeFormatDistanceToNow(folder.createdAt)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        {...listeners}
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
          isSelected ? "bg-primary/10" : ""
        } ${isDragging ? "opacity-50" : ""}`}
        style={{ paddingLeft: `${paddingLeft + 12}px` }}
        onClick={onSelect}
        onDoubleClick={onOpen}
      >
        <div className="flex items-center gap-1">
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpansion();
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          <div className="w-10 h-12 bg-muted/30 rounded flex items-center justify-center flex-shrink-0">
            <FolderOpen className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{folder.name}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="secondary" className="text-xs">
              {folder.pdfCount} PDFs
            </Badge>
            <span>{safeFormatDistanceToNow(folder.createdAt)}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface TreeNodePDFProps {
  pdf: PDFDocument;
  level: number;
  viewMode: ViewMode;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: (isCtrlClick: boolean) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onOpen: () => void;
}

function TreeNodePDF({
  pdf,
  level,
  viewMode,
  isSelected,
  isDragging,
  onSelect,
  onContextMenu,
  onOpen,
}: TreeNodePDFProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: pdf.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toUpperCase() || "PDF";
  };

  const paddingLeft = level * 20;

  if (viewMode === "details") {
    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        <div
          {...listeners}
          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
            isSelected ? "bg-primary/10" : ""
          } ${isDragging ? "opacity-50" : ""}`}
          style={{ paddingLeft: `${paddingLeft + 28}px` }}
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
              {safeFormatDistanceToNow(pdf.uploadedAt)}
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
      </div>
    );
  }

  // List view
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div
        {...listeners}
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
          isSelected ? "bg-primary/10" : ""
        } ${isDragging ? "opacity-50" : ""}`}
        style={{ paddingLeft: `${paddingLeft + 32}px` }}
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
            <span>{safeFormatDistanceToNow(pdf.uploadedAt)}</span>
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
    </div>
  );
}