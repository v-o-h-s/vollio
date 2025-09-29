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
import { formatDistanceToNow } from "date-fns";

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  pdfCount: number;
}

interface PDFFolderProps {
  folder: Folder;
  isSelected?: boolean;
  onSelect?: () => void;
  onOpen: () => void;
  onRename?: (folderId: string, newName: string) => void;
  onDelete?: (folderId: string) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  viewMode?: "grid" | "list";
  className?: string;
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
  className
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

  if (viewMode === "grid") {
    return (
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected ? 'ring-2 ring-primary' : ''
        } ${className}`}
        onClick={onSelect}
        onDoubleClick={onOpen}
        onContextMenu={onContextMenu}
      >
        <CardContent className="p-4">
          <div className="aspect-[3/4] mb-3 bg-muted/30 rounded-lg flex items-center justify-center">
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
              <span>{formatDistanceToNow(new Date(folder.createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
        isSelected ? 'bg-primary/10' : ''
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
          <span>{formatDistanceToNow(new Date(folder.createdAt), { addSuffix: true })}</span>
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
  viewMode?: "grid" | "list";
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
          <div className="aspect-[3/4] mb-3 bg-primary/5 rounded-lg flex items-center justify-center">
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