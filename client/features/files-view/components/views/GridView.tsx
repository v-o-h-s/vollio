"use client";

import { FileCard } from "../FileCard";
import { FolderCard } from "../FolderCard";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";

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

interface GridViewProps {
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

function DraggableFolder({
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

function DraggableFile({
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

export function GridView({
  folders,
  files,
  isItemSelected,
  onItemSelect,
  onFolderOpen,
  onFileOpen,
  onEmptyAreaClick,
  dragOverFolderId,
  allFolders,
}: GridViewProps) {
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
    <div
      className="grid bg-card/20 overflow-y-auto overflow-x-hidden h-[550px] grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 xl:grid-cols-10 gap-4 p-4 auto-rows-max shadow-xs border-1 rounded-xl"
      onClick={onEmptyAreaClick}
    >
      {folders.map((folder) => (
        <DraggableFolder
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
        <DraggableFile
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
