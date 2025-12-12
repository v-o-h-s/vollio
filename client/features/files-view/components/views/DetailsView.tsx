"use client";

import { FolderCard } from "../FolderCard";
import { FileCard } from "../FileCard";
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
  onEmptyAreaClick: () => void;
  dragOverFolderId: string | null;
}

function DraggableFolderRow({
  folder,
  isSelected,
  isDraggedOver,
  onSelect,
  onOpen,
  allFolders,
}: {
  folder: Folder;
  isSelected: boolean;
  isDraggedOver: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onOpen: () => void;
  allFolders: Folder[];
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
      className={isDragging ? "opacity-50" : ""}
      onClick={onSelect}
      onDoubleClick={onOpen}
    >
      <TableCell colSpan={5} className="p-0">
        <FolderCard
          id={folder.id}
          name={folder.name}
          parentId={folder.parent_id}
          isSelected={isSelected}
          isDraggedOver={isDraggedOver}
          onSelect={(e) => e.stopPropagation()}
          onOpen={() => {}}
          allFolders={allFolders}
        />
      </TableCell>
    </TableRow>
  );
}

function DraggableFileRow({
  file,
  isSelected,
  onSelect,
  onOpen,
  allFolders,
}: {
  file: File;
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onOpen: () => void;
  allFolders: Folder[];
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
      className={isDragging ? "opacity-50" : ""}
      onClick={onSelect}
      onDoubleClick={onOpen}
    >
      <TableCell colSpan={5} className="p-0">
        <FileCard
          id={file.id}
          filename={file.filename}
          folderId={file.folderId}
          isSelected={isSelected}
          onSelect={(e) => e.stopPropagation()}
          onOpen={() => {}}
          allFolders={allFolders}
        />
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
              allFolders={folders}
            />
          ))}
          {files.map((file) => (
            <DraggableFileRow
              key={file.id}
              file={file}
              isSelected={isItemSelected("file", file.id)}
              onSelect={(e) => onItemSelect("file", file.id, e)}
              onOpen={() => onFileOpen(file.id)}
              allFolders={folders}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
