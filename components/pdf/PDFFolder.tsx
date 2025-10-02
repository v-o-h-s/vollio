"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Folder, 
  FolderOpen, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Plus,
  FolderPlus
} from "lucide-react";
import { safeFormatDistanceToNow } from "@/lib/utils/dates";

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  pdfCount: number;
}

type ViewMode = "grid" | "list" | "compact" | "details";

interface PDFFolderProps {
  folder: Folder;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpen: () => void;
  onRename?: (folderId: string, newName: string) => void;
  onDelete?: (folderId: string) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  viewMode?: ViewMode;
  className?: string;
  // Drag and drop props
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragEnter?: () => void;
  onDragLeave?: () => void;
  onDrop?: () => void;
  isDropTarget?: boolean;
  isDragging?: boolean;
}

export function PDFFolder({
  folder,
  isSelected = false,
  onSelect,
  onOpen,
  onRename,
  onDelete,
  onContextMenu,
  viewMode = "grid",
  className,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDrop,
  isDropTarget = false,
  isDragging = false,
}: PDFFolderProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);

  const handleRename = () => {
    if (newName.trim() && newName !== folder.name) {
      onRename?.(folder.id, newName.trim());
    }
    setIsRenaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      setNewName(folder.name);
      setIsRenaming(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragEnter?.();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop?.();
  };

  if (viewMode === "grid") {
    return (
      <Card 
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={onDragLeave}
        onDrop={handleDrop}
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-primary' : ''
        } ${isDropTarget ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''} ${
          isDragging ? 'opacity-50' : ''
        } ${className}`}
        onClick={onSelect}
        onDoubleClick={onOpen}
        onContextMenu={onContextMenu}
      >
        <CardContent className="p-4">
          <div className="aspect-square mb-3 bg-muted/30 rounded-lg flex items-center justify-center">
            <Folder className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-1">
            {isRenaming ? (
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={handleKeyDown}
                className="h-6 text-sm"
                autoFocus
              />
            ) : (
              <p 
                className="font-medium text-sm truncate" 
                title={folder.name}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                }}
              >
                {folder.name}
              </p>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {folder.pdfCount} PDFs
              </Badge>
              <span>{safeFormatDistanceToNow(folder.createdAt)}</span>
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
        onDragOver={handleDragOver}
        onDragLeave={onDragLeave}
        onDrop={handleDrop}
        className={`p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
          isSelected ? 'bg-primary/10' : ''
        } ${isDropTarget ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''} ${
          isDragging ? 'opacity-50' : ''
        } ${className}`}
        onClick={onSelect}
        onDoubleClick={onOpen}
        onContextMenu={onContextMenu}
      >
        <div className="flex flex-col items-center text-center">
          <Folder className="h-8 w-8 text-primary mb-1" />
          {isRenaming ? (
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              className="h-6 text-xs w-full"
              autoFocus
            />
          ) : (
            <p 
              className="text-xs font-medium truncate w-full" 
              title={folder.name}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
              }}
            >
              {folder.name}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {folder.pdfCount} PDFs
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
        onDragOver={handleDragOver}
        onDragLeave={onDragLeave}
        onDrop={handleDrop}
        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
          isSelected ? 'bg-primary/10' : ''
        } ${isDropTarget ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''} ${
          isDragging ? 'opacity-50' : ''
        } ${className}`}
        onClick={onSelect}
        onDoubleClick={onOpen}
        onContextMenu={onContextMenu}
      >
        <Folder className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0 grid grid-cols-4 gap-4">
          {isRenaming ? (
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={handleKeyDown}
              className="h-6 text-sm"
              autoFocus
            />
          ) : (
            <p 
              className="font-medium truncate"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
              }}
            >
              {folder.name}
            </p>
          )}
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
            onContextMenu?.(e);
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
      onDragOver={handleDragOver}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
        isSelected ? 'bg-primary/10' : ''
      } ${isDropTarget ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950' : ''} ${
        isDragging ? 'opacity-50' : ''
      } ${className}`}
      onClick={onSelect}
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
    >
      <div className="w-10 h-12 bg-muted/30 rounded flex items-center justify-center flex-shrink-0">
        <Folder className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm mb-1"
            autoFocus
          />
        ) : (
          <p 
            className="font-medium truncate"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsRenaming(true);
            }}
          >
            {folder.name}
          </p>
        )}
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
          onContextMenu?.(e);
        }}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Folder creation component
interface CreateFolderProps {
  onCreateFolder: (name: string) => void;
  onCancel: () => void;
  viewMode?: ViewMode;
}

export function CreateFolder({ onCreateFolder, onCancel, viewMode = "grid" }: CreateFolderProps) {
  const [folderName, setFolderName] = useState("New Folder");

  const handleCreate = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCreate();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  if (viewMode === "grid") {
    return (
      <Card className="border-2 border-dashed border-primary">
        <CardContent className="p-4">
          <div className="aspect-square mb-3 bg-primary/5 rounded-lg flex items-center justify-center">
            <FolderPlus className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-sm"
              autoFocus
              onFocus={(e) => e.target.select()}
            />
            <div className="flex gap-1">
              <Button size="sm" onClick={handleCreate} className="flex-1">
                Create
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === "compact") {
    return (
      <div className="p-2 rounded-lg border-2 border-dashed border-primary bg-primary/5">
        <div className="flex flex-col items-center text-center">
          <FolderPlus className="h-8 w-8 text-primary mb-1" />
          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-xs mb-2 w-full"
            autoFocus
            onFocus={(e) => e.target.select()}
          />
          <div className="flex gap-1 w-full">
            <Button size="sm" onClick={handleCreate} className="flex-1 text-xs">
              Create
            </Button>
            <Button size="sm" variant="outline" onClick={onCancel} className="flex-1 text-xs">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "details") {
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg border-2 border-dashed border-primary bg-primary/5">
        <FolderPlus className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0 grid grid-cols-4 gap-4">
          <Input
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-sm"
            autoFocus
            onFocus={(e) => e.target.select()}
          />
          <span className="text-sm text-muted-foreground self-center">New folder</span>
          <span className="text-sm text-muted-foreground self-center">Folder</span>
          <span className="text-sm text-muted-foreground self-center">Now</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleCreate}>
            Create
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-dashed border-primary bg-primary/5">
      <div className="w-10 h-12 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
        <FolderPlus className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <Input
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="mb-2"
          autoFocus
          onFocus={(e) => e.target.select()}
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleCreate}>
            Create
          </Button>
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}