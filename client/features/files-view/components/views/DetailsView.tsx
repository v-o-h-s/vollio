"use client";

import { FileText, Folder, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDraggable, useDroppable } from "@dnd-kit/core";

interface File {
  id: string;
  filename: string;
  folderId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  size?: number;
}

interface Folder {
  id: string;
  name: string;
  parent_id?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface DetailsViewProps {
  folders: Folder[];
  files: File[];
  isItemSelected: (type: "file" | "folder", id: string) => boolean;
  onItemSelect: (type: "file" | "folder", id: string, e: React.MouseEvent) => void;
  onFolderOpen: (folderId: string) => void;
  onFileOpen: (fileId: string) => void;
  onContextMenu: (type: "file" | "folder", id: string, e: React.MouseEvent) => void;
  onOptionsClick: (type: "file" | "folder", id: string, e: React.MouseEvent) => void;
  onEmptyAreaClick: () => void;
  dragOverFolderId: string | null;
}

function DraggableFolderRow({
  folder,
  isSelected,
  isDraggedOver,
  onSelect,
  onOpen,
  onContextMenu,
  onOptionsClick,
}: {
  folder: Folder;
  isSelected: boolean;
  isDraggedOver: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onOpen: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onOptionsClick: (e: React.MouseEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `folder-${folder.id}`,
    data: { type: "folder", id: folder.id, name: folder.name },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `folder-${folder.id}`,
    data: { type: "folder", id: folder.id },
  });

  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <TableRow
      ref={(node) => {
        setNodeRef(node);
        setDroppableRef(node);
      }}
      {...listeners}
      {...attributes}
      className={`cursor-pointer transition-colors ${
        isDragging
          ? "opacity-50"
          : isSelected
          ? "bg-blue-50 dark:bg-blue-950"
          : isDraggedOver
          ? "bg-blue-100 dark:bg-blue-900"
          : "hover:bg-muted/50"
      }`}
      onClick={onSelect}
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <span className="truncate">{folder.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">Folder</TableCell>
      <TableCell className="text-muted-foreground">-</TableCell>
      <TableCell className="text-muted-foreground">{formatDate(folder.updatedAt)}</TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onOptionsClick(e);
          }}
          className="h-8 w-8 p-0"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

function DraggableFileRow({
  file,
  isSelected,
  onSelect,
  onOpen,
  onContextMenu,
  onOptionsClick,
}: {
  file: File;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onOpen: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onOptionsClick: (e: React.MouseEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `file-${file.id}`,
    data: { type: "file", id: file.id, name: file.filename },
  });

  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSize = (bytes: number | undefined) => {
    if (!bytes) return "-";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <TableRow
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-pointer transition-colors ${
        isDragging ? "opacity-50" : isSelected ? "bg-blue-50 dark:bg-blue-950" : "hover:bg-muted/50"
      }`}
      onClick={onSelect}
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-600 flex-shrink-0" />
          <span className="truncate">{file.filename}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">File</TableCell>
      <TableCell className="text-muted-foreground">{formatSize(file.size)}</TableCell>
      <TableCell className="text-muted-foreground">{formatDate(file.updatedAt)}</TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onOptionsClick(e);
          }}
          className="h-8 w-8 p-0"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function DetailsView({
  folders,
  files,
  isItemSelected,
  onItemSelect,
  onFolderOpen,
  onFileOpen,
  onContextMenu,
  onOptionsClick,
  onEmptyAreaClick,
  dragOverFolderId,
}: DetailsViewProps) {
  if (folders.length === 0 && files.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-64 text-muted-foreground"
        onClick={onEmptyAreaClick}
      >
        <p>No files or folders</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto" onClick={onEmptyAreaClick}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Modified</TableHead>
            <TableHead className="text-right w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {folders.map((folder) => (
            <DraggableFolderRow
              key={folder.id}
              folder={folder}
              isSelected={isItemSelected("folder", folder.id)}
              isDraggedOver={dragOverFolderId === folder.id}
              onSelect={(e) => onItemSelect("folder", folder.id, e)}
              onOpen={() => onFolderOpen(folder.id)}
              onContextMenu={(e) => onContextMenu("folder", folder.id, e)}
              onOptionsClick={(e) => onOptionsClick("folder", folder.id, e)}
            />
          ))}
          {files.map((file) => (
            <DraggableFileRow
              key={file.id}
              file={file}
              isSelected={isItemSelected("file", file.id)}
              onSelect={(e) => onItemSelect("file", file.id, e)}
              onOpen={() => onFileOpen(file.id)}
              onContextMenu={(e) => onContextMenu("file", file.id, e)}
              onOptionsClick={(e) => onOptionsClick("file", file.id, e)}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
