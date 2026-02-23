/**
 * @document DocumentsDirectoryViewer.tsx
 * @description A React component that displays a directory viewer for documents,
 * allowing users to navigate through folders and view documents in a structured manner.
 * It integrates with the application's state management to fetch and display
 * folders and documents, and provides a user-friendly interface for document management.
 */

"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
} from "@dnd-kit/core";
import { DocumentsToolbar } from "./DocumentsToolbar";
import { Breadcrumb } from "./Breadcrumb";

import { CreateFolderDialog } from "./dialogs/CreateFolderDialog";
import { ClassroomImportDialog } from "./dialogs/ClassroomImportDialog";
import { ContextMenu } from "./ContextMenu";
import { useDocumentsViewState } from "../hooks/useDocumentsViewState";
import { useBreadcrumbNavigation } from "../hooks/useBreadcrumbNavigation";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useFolder } from "../hooks/useFolder";
import { useDocument } from "../hooks/useDocument";
import { useDocumentUpload } from "../hooks/useDocumentUpload";
import { useDocumentActions } from "../hooks/useDocumentActions";
import { useDragMove } from "../hooks/useDragMove";
import { DocumentsContent } from "./DocumentsContent";

import { FileText, FolderPlus, Upload } from "lucide-react";
import { IoFolder, IoDocumentTextSharp } from "react-icons/io5";
import { useGetGoogleClassroomConnectionStatusQuery } from "@/lib/store/apiSlice";
import { FilesSkeleton } from "./DirectorySkeleton";
import { RobustFetchError } from "@/components/RobustFetchError";
import { UploadDocumentError } from "./errors/UploadDocumentError";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
export default function DocumentsDirectoryViewer() {
  const router = useRouter();
  // Use custom hooks for data management
  const {
    folders,
    isLoading: isLoadingFolders,
    error: foldersError,
    refetch: refetchFolders,
    createFolder,
  } = useFolder();
  const {
    documents,
    isLoading: isLoadingDocuments,
    error: documentsError,
    refetch: refetchDocuments,
    moveDocument,
    openDocument,
    uploadDocument,
    isUploading,
  } = useDocument();

  // Local state management with custom hook
  const {
    searchQuery,
    setSearchQuery,
    viewMode,
    setViewMode,
    currentFolder,
    setCurrentFolder,
    filteredDocuments,
    filteredFolders,
    selectedItems,
    isItemSelected,
    toggleItemSelection,
    clearSelection,
  } = useDocumentsViewState(documents, folders);

  // Breadcrumb navigation
  const { breadcrumbPath } = useBreadcrumbNavigation({
    currentFolder,
    folders,
  });

  // Drag and drop
  const {
    activeItem,
    dragOverFolderId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useDragAndDrop();

  // Dialog states and actions
  const {
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
  } = useDocumentActions({
    currentFolder,
    clearSelection,
    setCurrentFolder,
    openDocument,
    toggleItemSelection,
  });

  // Classroom status (connection-level)
  const { data: classroomStatus, isLoading: isClassroomChecking } =
    useGetGoogleClassroomConnectionStatusQuery();
  const classroomLabel = isClassroomChecking ? "Checking..." : "Connect LMS";
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Document upload hook
  const {
    documentInputRef,
    isDraggingDocument,
    handleUploadClick,
    handleDocumentInputChange,
    handleDocumentDragEnter,
    handleDocumentDragLeave,
    handleDocumentDragOver,
    handleDocumentDrop,
    lastUploadError,
    isErrorModalOpen,
    setIsErrorModalOpen,
    retryLastUpload,
  } = useDocumentUpload({
    currentFolder,
    uploadDocument,
    onUploadComplete: refetchDocuments,
  });

  const { handleDragEndWithMove } = useDragMove({
    handleDragEnd,
    moveDocument,
    refetchDocuments,
    refetchFolders,
  });

  // Error state
  if (documentsError || foldersError) {
    return (
      <RobustFetchError
        errorMessage={
          (documentsError as any)?.message ||
          (foldersError as any)?.message ||
          "Failed to fetch documents"
        }
        onRetry={() => {
          refetchDocuments();
          refetchFolders();
        }}
        onBack={() => {
          router.back();
        }}
        onReport={() => {
          toast.info("Report functionality coming soon");
        }}
      />
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEndWithMove}
      onDragCancel={handleDragCancel}
    >
      <div className="flex flex-col h-[700px] overflow-hidden rounded-xl p-4 container mx-auto">
        {/* Hidden Document Input */}
        <input
          type="file"
          ref={documentInputRef}
          className="hidden"
          multiple
          onChange={handleDocumentInputChange}
        />

        {/* Toolbar with search, view toggle, filter, and classroom button */}
        <div className="flex-none pb-4">
          <DocumentsToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            classroomLabel={classroomLabel}
            onClassroomClick={() =>
              toast.info(
                "LMS connection is under maintenance. Please try again later.",
              )
            }
            onUploadClick={handleUploadClick}
            onCreateFolderClick={() => setCreateFolderDialogOpen(true)}
          />
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex-none pb-2">
          <Breadcrumb
            path={breadcrumbPath}
            onNavigate={handleBreadcrumbNavigate}
          />
        </div>

        {/* Documents and folders content with drag-drop upload */}
        <div
          className="flex-1 rounded-lg overflow-hidden relative"
          onDragEnter={handleDocumentDragEnter}
          onDragLeave={handleDocumentDragLeave}
          onDragOver={handleDocumentDragOver}
          onDrop={handleDocumentDrop}
          onContextMenu={handleContextMenu}
        >
          {isLoadingDocuments || isLoadingFolders ? (
            <FilesSkeleton />
          ) : (
            <DocumentsContent
              viewMode={viewMode}
              folders={filteredFolders}
              documents={filteredDocuments}
              isItemSelected={isItemSelected}
              onItemSelect={handleItemSelect}
              onFolderOpen={handleFolderOpen}
              onDocumentOpen={handleDocumentOpen}
              onEmptyAreaClick={clearSelection}
              dragOverFolderId={dragOverFolderId}
              allFolders={folders}
            />
          )}

          {/* Drag overlay - Full screen popup for upload only*/}
          {isDraggingDocument && (
            <div className="fixed  inset-0 bg-background/95  backdrop-blur-sm flex items-center justify-center z-100">
              <div className="max-w-md w-full mx-4 bg-card border-2 border-dashed border-primary rounded-2xl p-12 shadow-2xl">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-neutral-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <Upload className="h-20 w-20 text-black dark:text-white mx-auto relative animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">
                      Drop your documents here
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentFolder
                        ? "Documents will be uploaded to the current folder"
                        : "Documents will be uploaded to the root directory"}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Multiple documents supported
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <UploadDocumentError
        error={lastUploadError}
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        onRetry={retryLastUpload}
      />

      {/* Dialogs */}
      <CreateFolderDialog
        open={createFolderDialogOpen}
        onOpenChange={setCreateFolderDialogOpen}
        onSubmit={handleCreateFolder}
        parentFolderId={currentFolder}
      />

      <ClassroomImportDialog
        open={classroomDialogOpen}
        onOpenChange={setClassroomDialogOpen}
        onImported={refetchDocuments}
      />

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem && (
          <div className="cursor-pointer flex flex-col justify-center items-center    rounded-lg shadow-lg w-[140px] opacity-90">
            <div className="w-full px-2">
              <div className="aspect-square  w-[90px] h-[90px] rounded-lg flex flex-col items-center justify-center mx-auto ">
                {activeItem.type === "folder" ? (
                  <IoFolder className="h-12 w-12 text-neutral-700 dark:text-neutral-300" />
                ) : (
                  <IoDocumentTextSharp className="h-12 w-12 text-neutral-600 dark:text-neutral-400" />
                )}
              </div>
              <p
                className="text-sm font-medium text-center line-clamp-2 wrap-break-word w-full mt-2"
                title={activeItem.name}
              >
                {activeItem.name}
              </p>
            </div>
          </div>
        )}
      </DragOverlay>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          sections={[
            {
              actions: [
                {
                  label: "Create Folder",
                  icon: <FolderPlus className="h-4 w-4" />,
                  onClick: () => {
                    setCreateFolderDialogOpen(true);
                  },
                },
              ],
            },
          ]}
        />
      )}
    </DndContext>
  );
}
