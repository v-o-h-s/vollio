"use client";

import { FolderCard } from "../FolderCard";
import { FileCard } from "../FileCard";
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

interface CompactViewProps {
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

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        setDroppableRef(node);
      }}
      {...listeners}
      {...attributes}
      className={isDragging ? "opacity-50" : ""}
    >
      <FolderCard
        id={folder.id}
        name={folder.name}
        parentId={folder.parent_id}
        isSelected={isSelected}
        isDraggedOver={isDraggedOver}
        onSelect={onSelect}
        onOpen={onOpen}
        allFolders={allFolders}
      />
    </div>
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

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={isDragging ? "opacity-50" : ""}
    >
      <FileCard
        id={file.id}
        filename={file.filename}
        folderId={file.folderId}
        isSelected={isSelected}
        onSelect={onSelect}
        onOpen={onOpen}
        allFolders={allFolders}
      />
    </div>
  );
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
    <div className="space-y-0.5 p-2" onClick={onEmptyAreaClick}>
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
    </div>
  );
}
