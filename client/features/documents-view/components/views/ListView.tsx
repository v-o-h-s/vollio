"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Cloud, HardDrive, BookOpen, Folder, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
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
  documents: Document[];
  isItemSelected: (type: "document" | "folder", id: string) => boolean;
  onItemSelect: (
    type: "document" | "folder",
    id: string,
    e: React.MouseEvent
  ) => void;
  onFolderOpen: (folderId: string) => void;
  onDocumentOpen: (documentId: string) => void;
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

export function ListView({
  folders,
  documents,
  isItemSelected,
  onItemSelect,
  onFolderOpen,
  onDocumentOpen,
  onEmptyAreaClick,
  dragOverFolderId,
  allFolders,
}: ListViewProps) {
  if (folders.length === 0 && documents.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-64 text-muted-foreground"
        onClick={onEmptyAreaClick}
      >
        <p>No documents or folders</p>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full overflow-y-auto overflow-x-hidden bg-card/20"
      onClick={onEmptyAreaClick}
    >
      {/* Folders Section */}
      <div className="space-y-1 p-4">
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
                "flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all",
                "hover:bg-muted/50",
                isSelected && "bg-primary/10 border border-primary/50",
                isDraggedOver && "bg-primary/20 border border-primary",
                isDragging && "opacity-50"
              )}
              onClick={(e) => onItemSelect("folder", folder.id, e)}
              onDoubleClick={() => onFolderOpen(folder.id)}
            >
              <Folder className="w-5 h-5 text-blue-500 shrink-0" />
              <span
                className="text-sm font-medium flex-1 truncate"
                title={folder.name}
              >
                {folder.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Documents Section */}
      <div className="space-y-1 px-4 pb-4">
        {documents.map((document) => {
          const { attributes, listeners, setNodeRef, isDragging } =
            useDraggable({
              id: `document-${document.id}`,
              data: { type: "document", id: document.id, name: document.name },
            });

          const isSelected = isItemSelected("document", document.id);

          return (
            <div
              key={document.id}
              ref={setNodeRef}
              {...listeners}
              {...attributes}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all",
                "hover:bg-muted/50",
                isSelected && "bg-primary/10 border border-primary/50",
                isDragging && "opacity-50"
              )}
              onClick={(e) => onItemSelect("document", document.id, e)}
              onDoubleClick={() => onDocumentOpen(document.id)}
            >
              <FileIcon className="w-5 h-5 text-gray-400 shrink-0" />
              <span
                className="text-sm font-medium flex-1 truncate"
                title={document.name}
              >
                {document.name}
              </span>
              <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground shrink-0">
                <div className="flex items-center gap-1">
                  {getSourceIcon(document.source)}
                  <span>{getSourceLabel(document.source)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
