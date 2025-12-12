"use client";

import { FileText, Folder, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDraggable, useDroppable } from "@dnd-kit/core";

interface File {
  id: string;
  filename: string;
  folderId?: string | null;
}

interface Folder {
  id: string;
  name: string;
  parent_id?: string | null;
}

interface ListViewProps {
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

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        setDroppableRef(node);
      }}
      {...listeners}
      {...attributes}
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
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
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Folder className="h-5 w-5 text-blue-600 flex-shrink-0" />
        <span className="truncate font-medium">{folder.name}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onOptionsClick(e);
        }}
        className="h-8 w-8 p-0 flex-shrink-0"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
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

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
        isDragging ? "opacity-50" : isSelected ? "bg-blue-50 dark:bg-blue-950" : "hover:bg-muted/50"
      }`}
      onClick={onSelect}
      onDoubleClick={onOpen}
      onContextMenu={onContextMenu}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <FileText className="h-5 w-5 text-gray-600 flex-shrink-0" />
        <span className="truncate">{file.filename}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onOptionsClick(e);
        }}
        className="h-8 w-8 p-0 flex-shrink-0"
      >
        <MoreVertical className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function ListView({
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
}: ListViewProps) {
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
    <div className="space-y-1 p-4" onClick={onEmptyAreaClick}>
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
    </div>
  );
}
