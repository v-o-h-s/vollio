"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Cloud, HardDrive, BookOpen, Folder, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface File {
  id: string;
  filename: string;
  folderId?: string | null;
  source?: "local" | "cloud" | "classroom";
}

interface Folder {
  id: string;
  name: string;
  parent_id?: string | null;
}

interface CompactViewProps {
  folders: Folder[];
  files: File[];
  isItemSelected: (type: "file" | "folder", id: string) => boolean;
  onItemSelect: (
    type: "file" | "folder",
    id: string,
    e: React.MouseEvent
  ) => void;
  onFolderOpen: (folderId: string) => void;
  onFileOpen: (fileId: string) => void;
  onEmptyAreaClick: () => void;
  dragOverFolderId: string | null;
  allFolders: Folder[];
}

function getSourceIcon(source?: string) {
  switch (source) {
    case "cloud":
      return <Cloud className="w-3 h-3 text-blue-500" />;
    case "classroom":
      return <BookOpen className="w-3 h-3 text-purple-500" />;
    case "local":
    default:
      return <HardDrive className="w-3 h-3 text-gray-500" />;
  }
}

export function CompactView({
  folders,
  files,
  isItemSelected,
  onItemSelect,
  onFolderOpen,
  onFileOpen,
  onEmptyAreaClick,
  dragOverFolderId,
  allFolders,
}: CompactViewProps) {
  if (folders.length === 0 && files.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-64 text-muted-foreground"
        onClick={onEmptyAreaClick}
      >
        <p className="text-sm">No files or folders</p>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full overflow-y-auto overflow-x-hidden bg-card/20 p-2"
      onClick={onEmptyAreaClick}
    >
      {/* Folders */}
      <div className="space-y-0.5">
        {folders.map((folder) => {
          const { attributes, listeners, setNodeRef, isDragging } =
            useDraggable({
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
            <div
              key={folder.id}
              ref={(node) => {
                setNodeRef(node);
                setDroppableRef(node);
              }}
              {...listeners}
              {...attributes}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer text-sm transition-all",
                "hover:bg-muted/50",
                isSelected && "bg-primary/10 border border-primary/50",
                isDraggedOver && "bg-primary/20 border border-primary",
                isDragging && "opacity-50"
              )}
              onClick={(e) => onItemSelect("folder", folder.id, e)}
              onDoubleClick={() => onFolderOpen(folder.id)}
            >
              <Folder className="w-4 h-4 text-blue-500 shrink-0" />
              <span className="truncate" title={folder.name}>
                {folder.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Files */}
      <div className="space-y-0.5">
        {files.map((file) => {
          const { attributes, listeners, setNodeRef, isDragging } =
            useDraggable({
              id: `file-${file.id}`,
              data: { type: "file", id: file.id, name: file.filename },
            });

          const isSelected = isItemSelected("file", file.id);

          return (
            <div
              key={file.id}
              ref={setNodeRef}
              {...listeners}
              {...attributes}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer text-sm transition-all",
                "hover:bg-muted/50",
                isSelected && "bg-primary/10 border border-primary/50",
                isDragging && "opacity-50"
              )}
              onClick={(e) => onItemSelect("file", file.id, e)}
              onDoubleClick={() => onFileOpen(file.id)}
            >
              <FileIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate flex-1" title={file.filename}>
                {file.filename}
              </span>
              <div className="flex items-center opacity-70 shrink-0">
                {getSourceIcon(file.source)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
