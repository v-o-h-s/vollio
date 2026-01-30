/**
 * @document index.ts
 * @description Export all components and hooks from documents-view feature
 */

// Main component
export { default as DocumentsDirectoryViewer } from "./components/DocumentsDirectoryViewer";

// Components
export { Breadcrumb } from "./components/Breadcrumb";
export { ContextMenu } from "./components/ContextMenu";
export { DocumentCard } from "./components/DocumentCard";
export { FolderCard } from "./components/FolderCard";
export { DocumentsToolbar } from "./components/DocumentsToolbar";

// Views
export { GridView } from "./components/views/GridView";
export { ListView } from "./components/views/ListView";
export { CompactView } from "./components/views/CompactView";
export { DetailsView } from "./components/views/DetailsView";

// Dialogs
export { CreateFolderDialog } from "./components/dialogs/CreateFolderDialog";
export { RenameDialog } from "./components/dialogs/RenameDialog";
export { MoveItemDialog } from "./components/dialogs/MoveItemDialog";

// Hooks
export { useDocumentsViewState } from "./hooks/useDocumentsViewState";
export { useBreadcrumbNavigation } from "./hooks/useBreadcrumbNavigation";
export { useContextMenu } from "./hooks/useContextMenu";
export { useDragAndDrop } from "./hooks/useDragAndDrop";
export { useFolder } from "./hooks/useFolder";
export { useDocument } from "./hooks/useDocument";

// Types
export type { Document, Folder, SelectedItem } from "./hooks/useDocumentsViewState";
export type { BreadcrumbItem } from "./components/Breadcrumb";
export type {
  ContextMenuAction,
  ContextMenuSection,
} from "./components/ContextMenu";
export type { DragItem } from "./hooks/useDragAndDrop";
