"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Cloud, HardDrive, BookOpen, Folder, FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
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
  documents: Document[];
  isItemSelected: (type: "document" | "folder", id: string) => boolean;
  onItemSelect: (
    type: "document" | "folder",
    id: string,
    e: React.MouseEvent,
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
  documents,
  isItemSelected,
  onItemSelect,
  onFolderOpen,
  onDocumentOpen,
  onEmptyAreaClick,
  dragOverFolderId,
  allFolders,
}: CompactViewProps) {
  if (folders.length === 0 && documents.length === 0) {
    return (
      <div
        className="grid bg-neutral-100 overflow-y-auto overflow-x-hidden h-[550px] grid-cols-1 gap-4 p-4 auto-rows-max shadow-xs border border-neutral-200 rounded-xl"
        onClick={onEmptyAreaClick}
      >
        <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-4">
          <div className="bg-neutral-200 p-6 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M12 18v-6" />
              <path d="M9 15l3-3 3 3" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-neutral-700">
              No documents found
            </h3>
            <p className="text-sm mt-1 max-w-[250px] mx-auto">
              Upload documents to get started. You can drag and drop files here.
            </p>
          </div>
        </div>
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
                isDragging && "opacity-50",
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

      {/* Documents */}
      <div className="space-y-0.5">
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
                "flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer text-sm transition-all",
                "hover:bg-muted/50",
                isSelected && "bg-primary/10 border border-primary/50",
                isDragging && "opacity-50",
              )}
              onClick={(e) => onItemSelect("document", document.id, e)}
              onDoubleClick={() => onDocumentOpen(document.id)}
            >
              <FileIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="truncate flex-1" title={document.name}>
                {document.name}
              </span>
              <div className="flex items-center opacity-70 shrink-0">
                {getSourceIcon(document.source)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
