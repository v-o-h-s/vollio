"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Cloud, HardDrive, BookOpen, Folder, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface File {
  id: string;
  filename: string;
  folderId?: string | null;
  source?: "local" | "cloud" | "classroom";
  createdAt?: string;
  size?: number;
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
  onEmptyAreaClick: () => void;
  dragOverFolderId: string | null;
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

export function ListView({
  folders,
  files,
  isItemSelected,
  onItemSelect,
  onFolderOpen,
  onFileOpen,
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
    <div className="w-full" onClick={onEmptyAreaClick}>
      {/* Folders Section */}
      <div className="space-y-1 p-4">
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
            <div
              key={folder.id}
              ref={(node) => {
                setNodeRef(node);
                setDroppableRef(node);
              }}
              {...listeners}
              {...attributes}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all",
                "hover:bg-muted/50",
                isSelected && "bg-primary/10 border border-primary/50",
                isDraggedOver && "bg-primary/20 border border-primary",
                isDragging && "opacity-50"
              )}
              onClick={(e) => onItemSelect("folder", folder.id, e)}
              onDoubleClick={() => onFolderOpen(folder.id)}
            >
              <Folder className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span className="text-sm font-medium flex-1 truncate">{folder.name}</span>
            </div>
          );
        })}
      </div>

      {/* Files Section */}
      <div className="space-y-1 px-4 pb-4">
        {files.map((file) => {
          const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
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
                "flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all",
                "hover:bg-muted/50",
                isSelected && "bg-primary/10 border border-primary/50",
                isDragging && "opacity-50"
              )}
              onClick={(e) => onItemSelect("file", file.id, e)}
              onDoubleClick={() => onFileOpen(file.id)}
            >
              <FileIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="text-sm font-medium flex-1 truncate">{file.filename}</span>
              <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground flex-shrink-0">
                <div className="flex items-center gap-1">
                  {getSourceIcon(file.source)}
                  <span>{getSourceLabel(file.source)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
