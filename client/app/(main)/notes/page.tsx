"use client";

import React, { useState, useRef } from "react";
import { useGetNotesQuery, useDeleteNoteMutation } from "@/lib/store/apiSlice";
import { useRouter } from "next/navigation";
import { Plus, FileText, Notebook } from "lucide-react";
import { RiRobot3Fill as RobotIcon } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EnhancedNotesListSkeleton } from "@/components/ui/enhanced-notes-list-skeleton";
import { EnhancedNotesList } from "@/components/ui/enhanced-notes-list";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { useFloatingSidebarIntegration } from "@/hooks/use-floating-sidebar";
import { toast } from "react-toastify";
import { RobustFetchError } from "@/components/RobustFetchError";
import { getErrorMessage } from "@/lib/utils/rtk-error-transform";

/**
 * Notes List Page
 *
 * Modern, responsive notes list with enhanced design system.
 * Features adaptive grid layout, advanced filtering/sorting, and smooth animations.
 * Integrates with the Document annotation system to show linked notes.
 */
const NotesPage: React.FC = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");
  const [sortBy, setSortBy] = useState<
    "updated" | "created" | "title" | "wordCount"
  >("updated");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterBy, setFilterBy] = useState("");
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // Refs for sidebar integration
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    noteId: string | null;
    noteTitle: string;
  }>({
    isOpen: false,
    noteId: null,
    noteTitle: "",
  });

  const {
    data: notesRaw = [],
    isLoading,
    error,
    refetch,
  } = useGetNotesQuery({});

  // Transform API response to match Note type
  const notes = notesRaw.map((note) => ({
    ...note,
    userId: "", // Default userId for list view
    content: { type: "doc", content: [] }, // Empty valid JSONContent
    documentAnnotationId: undefined,
  }));

  const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();

  // Integrate with floating sidebar
  useFloatingSidebarIntegration({
    searchNotes: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    },
    filterNotes: () => {
      // Toggle filter visibility or focus filter input
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    },
    sortNotes: () => {
      // Cycle through sort options
      const sortOptions: Array<"updated" | "created" | "title" | "wordCount"> =
        ["updated", "created", "title", "wordCount"];
      const currentIndex = sortOptions.indexOf(sortBy);
      const nextIndex = (currentIndex + 1) % sortOptions.length;
      setSortBy(sortOptions[nextIndex]);

      // Show toast to indicate sort change
      toast.success(`Sorted by ${sortOptions[nextIndex]}`);
    },
    toggleNotesView: () => {
      // Cycle through view modes
      const viewModes: Array<"grid" | "list" | "compact"> = [
        "grid",
        "list",
        "compact",
      ];
      const currentIndex = viewModes.indexOf(viewMode);
      const nextIndex = (currentIndex + 1) % viewModes.length;
      setViewMode(viewModes[nextIndex]);

      // Show toast to indicate view change
      toast.success(`Switched to ${viewModes[nextIndex]} view`);
    },
    filterStarred: () => {
      setShowStarredOnly(!showStarredOnly);
      toast.success(
        showStarredOnly ? "Showing all notes" : "Showing starred notes only",
      );
    },
  });

  const handleCreateNote = () => {
    router.push("/notes/new");
  };

  const handleEditNote = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  const handleViewDocumentAnnotation = (annotationId: string) => {
    // Navigate to the Document with the annotation highlighted
    // This would require additional logic to find the Document and page
    router.push(`/annotations/${annotationId}`);
  };

  const handleDeleteNote = (noteId: string) => {
    // Find the note to get its title for confirmation
    const noteToDelete = notes.find((note) => note.id === noteId);
    const noteTitle = noteToDelete?.title || "Untitled Note";

    // Open confirmation dialog
    setDeleteDialog({
      isOpen: true,
      noteId,
      noteTitle,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.noteId) return;

    try {
      // Show loading toast
      const loadingToast = toast.loading("Deleting note...");

      // Delete the note
      await deleteNote(deleteDialog.noteId).unwrap();

      // Close dialog
      setDeleteDialog({ isOpen: false, noteId: null, noteTitle: "" });

      // Show success toast
      toast.update(loadingToast, {
        render: `"${deleteDialog.noteTitle}" has been deleted`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // Optionally refetch the notes list to ensure UI is in sync
      refetch();
    } catch (error) {
      console.error("Failed to delete note:", error);

      // Show error toast
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete note. Please try again.",
      );
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialog({ isOpen: false, noteId: null, noteTitle: "" });
  };

  const handleDuplicateNote = (noteId: string) => {
    // TODO: Implement duplicate functionality
    console.log("Duplicate note:", noteId);
  };

  const handleToggleStarNote = (noteId: string) => {
    // TODO: Implement star functionality
    console.log("Toggle star:", noteId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              Notes
            </h1>
            <p className="text-sm text-muted-foreground/80">
              Organize your thoughts and link them to Document annotations
            </p>
          </div>
          <Button
            onClick={handleCreateNote}
            size="sm"
            className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus size={14} />
            New Note
          </Button>
        </div>

        <EnhancedNotesListSkeleton count={8} viewMode={viewMode} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6 container mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {/* Enhanced Header with Better Typography and Spacing */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight flex items-center gap-2">
              <Notebook className="w-8 h-8" />
              Notes
            </h1>
            <p className="text-sm text-muted-foreground/80">
              Organize your thoughts and link them to Document annotations
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search notes..."
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="pl-3 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-48 text-sm"
              />
            </div>

            <Button
              onClick={handleCreateNote}
              size="sm"
              className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus size={14} />
              New Note
            </Button>
          </div>
        </div>

        {/* Enhanced Notes List with Modern Layout */}
        {error && (
          <RobustFetchError
            errorMessage={getErrorMessage(error, "Failed to load notes")}
            onRetry={refetch}
            onBack={() => router.back()}
          />
        )}
        <EnhancedNotesList
          notes={notes}
          viewMode={viewMode}
          sortBy={sortBy}
          sortOrder={sortOrder}
          filterBy={filterBy}
          onCreateNote={handleCreateNote}
          onEditNote={handleEditNote}
          onViewAnnotation={handleViewDocumentAnnotation}
          onDeleteNote={handleDeleteNote}
          onDuplicateNote={handleDuplicateNote}
          onToggleStarNote={handleToggleStarNote}
          onViewModeChange={setViewMode}
          onSortChange={(newSortBy, newSortOrder) => {
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
          }}
          onFilterChange={setFilterBy}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          isOpen={deleteDialog.isOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          noteTitle={deleteDialog.noteTitle}
          isDeleting={isDeleting}
        />
      </div>
    </ErrorBoundary>
  );
};

export default NotesPage;
