"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Cloud, HardDrive, BookOpen, Folder, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface File {
  id: string;
  filename: string;
  folderId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  size?: number;
  source?: "local" | "cloud" | "classroom";
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
  onEmptyAreaClick: () => void;
  dragOverFolderId: string | null;
  allFolders: Folder[];
}

function getSourceIcon(source?: string) {
  switch (source) {
    case "cloud":
      return <Cloud className="w-4 h-4 text-blue-500" />;
    case "classroom":
      return <BookOpen className="w-4 h-4 text-purple-500" />;
    case "local":
    default:
      return <HardDrive className="w-4 h-4 text-gray-500" />;
  }
}

function getSourceLabel(source?: string) {
  switch (source) {
    case "cloud":
      return "Cloud";
    case "classroom":
      return "Classroom";
    case "local":
    default:
      return "Local";
  }
}

function formatDate(date: string | undefined) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSize(bytes: number | undefined) {
  if (!bytes) return "-";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function DetailsView({
  folders,
  files,
  isItemSelected,
  onItemSelect,
  onFolderOpen,
  onFileOpen,
  onEmptyAreaClick,
  dragOverFolderId,
  allFolders,
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
            <TableHead>Source</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Modified</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Folders */}
          {folders.map((folder) => {
            const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
              id: `folder-${folder.id}`,
              data: { type: "folder", id: folder.id, name: folder.name },
            });

            const { setNodeRef: setDroppableRef } = useDroppable({
              id: `folder-${folder.id}`,
              data: { type: "folder", id: folder.id },
            });

            const isSelected = isItemSelected("folder", folder.id);
            const isDraggedOver = dragOverFolderId === folder.id;

            return (
              <TableRow
                key={folder.id}
                ref={(node) => {
                  setNodeRef(node);
                  setDroppableRef(node);
                }}
                {...listeners}
                {...attributes}
                className={cn(
                  "cursor-pointer transition-all",
                  isSelected && "bg-primary/10",
                  isDraggedOver && "bg-primary/20",
                  isDragging && "opacity-50"
                )}
                onClick={(e) => onItemSelect("folder", folder.id, e)}
                onDoubleClick={() => onFolderOpen(folder.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-blue-500" />
                    <span>{folder.name}</span>
                  </div>
                </TableCell>
                <TableCell>Folder</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>{formatDate(folder.updatedAt)}</TableCell>
              </TableRow>
            );
          })}

          {/* Files */}
          {files.map((file) => {
            const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
              id: `file-${file.id}`,
              data: { type: "file", id: file.id, name: file.filename },
            });

            const isSelected = isItemSelected("file", file.id);

            return (
              <TableRow
                key={file.id}
                ref={setNodeRef}
                {...listeners}
                {...attributes}
                className={cn(
                  "cursor-pointer transition-all",
                  isSelected && "bg-primary/10",
                  isDragging && "opacity-50"
                )}
                onClick={(e) => onItemSelect("file", file.id, e)}
                onDoubleClick={() => onFileOpen(file.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileIcon className="w-4 h-4 text-gray-400" />
                    <span>{file.filename}</span>
                  </div>
                </TableCell>
                <TableCell>File</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {getSourceIcon(file.source)}
                    <span className="text-xs">{getSourceLabel(file.source)}</span>
                  </div>
                </TableCell>
                <TableCell>{formatSize(file.size)}</TableCell>
                <TableCell>{formatDate(file.updatedAt)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
