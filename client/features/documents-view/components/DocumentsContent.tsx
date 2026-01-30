import React from "react";
import { GridView } from "../components/views/GridView";
import { ListView } from "../components/views/ListView";
import { CompactView } from "../components/views/CompactView";
import { DetailsView } from "../components/views/DetailsView";

interface DocumentsContentProps {
  viewMode: "grid" | "list" | "compact" | "details";
  folders: any[];
  documents: any[];
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
  allFolders: any[];
}

export function DocumentsContent({
  viewMode,
  folders,
  documents,
  isItemSelected,
  onItemSelect,
  onFolderOpen,
  onDocumentOpen,
  onEmptyAreaClick,
  dragOverFolderId,
  allFolders,
}: DocumentsContentProps) {
  const viewProps = {
    folders,
    documents,
    isItemSelected,
    onItemSelect,
    onFolderOpen,
    onDocumentOpen,
    onEmptyAreaClick,
    dragOverFolderId,
    allFolders,
  };

  switch (viewMode) {
    case "grid":
      return <GridView {...viewProps} />;
    case "list":
      return <ListView {...viewProps} />;
    case "compact":
      return <CompactView {...viewProps} />;
    case "details":
      return <DetailsView {...viewProps} />;
    default:
      return <GridView {...viewProps} />;
  }
}
