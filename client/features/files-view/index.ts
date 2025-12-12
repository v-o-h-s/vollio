/**
 * @file index.ts
 * @description Export all components and hooks from files-view feature
 */

// Main component
export { default as FilesDirectoryViewer } from "./components/FilesDirectoryViewer";

// Components
export { Breadcrumb } from "./components/Breadcrumb";
export { ContextMenu } from "./components/ContextMenu";
export { FileCard } from "./components/FileCard";
export { FolderCard } from "./components/FolderCard";
export { FilesToolbar } from "./components/FilesToolbar";

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
export { useFilesViewState } from "./hooks/useFilesViewState";
export { useBreadcrumbNavigation } from "./hooks/useBreadcrumbNavigation";
export { useContextMenu } from "./hooks/useContextMenu";
export { useDragAndDrop } from "./hooks/useDragAndDrop";
export { useFileExplorerShortcuts } from "./hooks/useFileExplorerShortcuts";

// Types
export type { File, Folder, SelectedItem } from "./hooks/useFilesViewState";
export type { BreadcrumbItem } from "./components/Breadcrumb";
export type { ContextMenuAction, ContextMenuSection } from "./components/ContextMenu";
export type { DragItem } from "./hooks/useDragAndDrop";
