import { useState } from "react";
import { useFolder } from "./useFolder";
import { useDocument } from "./useDocument";

interface UseDocumentActionsProps {
  currentFolder: string | null;
  clearSelection: () => void;
  setCurrentFolder: (folderId: string | null) => void;
  openDocument: (documentId: string) => void;
  toggleItemSelection: (
    type: "document" | "folder",
    id: string,
    isMultiSelect: boolean,
  ) => void;
}

export function useDocumentActions({
  currentFolder,
  clearSelection,
  setCurrentFolder,
  openDocument,
  toggleItemSelection,
}: UseDocumentActionsProps) {
  const { createFolder } = useFolder();
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [classroomDialogOpen, setClassroomDialogOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleFolderOpen = (folderId: string) => {
    setCurrentFolder(folderId);
    clearSelection();
  };

  const handleDocumentOpen = (documentId: string) => {
    openDocument(documentId);
  };

  const handleCreateFolder = async (name: string) => {
    await createFolder(name, currentFolder);
  };

  const handleItemSelect = (
    type: "document" | "folder",
    id: string,
    e: React.MouseEvent,
  ) => {
    const isMultiSelect = e.ctrlKey || e.metaKey;
    toggleItemSelection(type, id, isMultiSelect);
  };

  const handleBreadcrumbNavigate = (folderId: string | null) => {
    setCurrentFolder(folderId);
    clearSelection();
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return {
    createFolderDialogOpen,
    setCreateFolderDialogOpen,
    classroomDialogOpen,
    setClassroomDialogOpen,
    contextMenu,
    setContextMenu,
    handleFolderOpen,
    handleDocumentOpen,
    handleCreateFolder,
    handleContextMenu,
    handleItemSelect,
    handleBreadcrumbNavigate,
  };
}
