"use client";

import React, { useState } from "react";
import { useGetNotesQuery, useDeleteNoteMutation } from "@/lib/store/apiSlice";
import { useRouter } from "next/navigation";
import { Plus, FileText, Sparkles, BookOpen, PenTool, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useNoteSync } from "@/hooks/use-note-sync";
import { EnhancedNotesListSkeleton } from "@/components/ui/enhanced-notes-list-skeleton";
import { EnhancedNotesList } from "@/components/ui/enhanced-notes-list";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import toast from "react-hot-toast";

/**
 * Notes List Page
 * 
 * Modern, responsive notes list with enhanced design system.
 * Features adaptive grid layout, advanced filtering/sorting, and smooth animations.
 * Integrates with the PDF annotation system to show linked notes.
 */
const NotesPage: React.FC = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title' | 'wordCount'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState('');
  
  // Delete confirmation dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    noteId: string | null;
    noteTitle: string;
  }>({
    isOpen: false,
    noteId: null,
    noteTitle: '',
  });
  
  const {
    data: notes = [],
    isLoading,
    error,
    refetch,
  } = useGetNotesQuery({});

  const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();

  // Calculate content statistics
  const extractTextFromContent = (content: any): string => {
    if (!content || !content.content) return '';
    
    const extractText = (node: any): string => {
      if (node.type === 'text') {
        return node.text || '';
      }
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractText).join('');
      }
      return '';
    };
    
    return content.content.map(extractText).join('');
  };

  const totalWords = notes.reduce((acc, note) => {
    const text = extractTextFromContent(note.content);
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    return acc + wordCount;
  }, 0);

  const totalCharacters = notes.reduce((acc, note) => {
    const text = extractTextFromContent(note.content);
    return acc + text.length;
  }, 0);

  // Format content size (using characters as "size")
  const formatContentSize = (chars: number): string => {
    if (chars === 0) return '0 chars';
    if (chars < 1000) return `${chars} chars`;
    if (chars < 1000000) return `${(chars / 1000).toFixed(1)}K chars`;
    return `${(chars / 1000000).toFixed(1)}M chars`;
  };

  // Cross-tab synchronization
  useNoteSync({
    enableAutoNavigation: false, // Don't auto-navigate from list page
    enableAutoUpdate: true,
  });

  const handleCreateNote = () => {
    router.push("/dashboard/notes/new");
  };

  const handleEditNote = (noteId: string) => {
    router.push(`/dashboard/notes/${noteId}`);
  };

  const handleViewPDFAnnotation = (annotationId: string) => {
    // Navigate to the PDF with the annotation highlighted
    // This would require additional logic to find the PDF and page
    router.push(`/dashboard/annotations/${annotationId}`);
  };

  const handleDeleteNote = (noteId: string) => {
    // Find the note to get its title for confirmation
    const noteToDelete = notes.find(note => note.id === noteId);
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
      setDeleteDialog({ isOpen: false, noteId: null, noteTitle: '' });

      // Show success toast
      toast.success(`"${deleteDialog.noteTitle}" has been deleted`, {
        id: loadingToast,
      });

      // Optionally refetch the notes list to ensure UI is in sync
      refetch();
    } catch (error) {
      console.error("Failed to delete note:", error);
      
      // Show error toast
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to delete note. Please try again."
      );
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialog({ isOpen: false, noteId: null, noteTitle: '' });
  };

  const handleDuplicateNote = (noteId: string) => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate note:', noteId);
  };

  const handleToggleStarNote = (noteId: string) => {
    // TODO: Implement star functionality
    console.log('Toggle star:', noteId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Notes</h1>
            <p className="text-sm text-muted-foreground/80">
              Organize your thoughts and link them to PDF annotations
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

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Notes</h1>
            <p className="text-sm text-muted-foreground/80">
              Organize your thoughts and link them to PDF annotations
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
        
        <div className="bg-card/30 backdrop-blur-sm rounded-xl p-12 text-center border border-border/40">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-destructive/10 flex items-center justify-center">
              <FileText size={32} className="text-destructive" />
            </div>
            <h2 className="text-2xl font-semibold text-destructive mb-3">
              Failed to load notes
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              There was an error loading your notes. This might be a temporary issue with the connection.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                size="sm"
                className="flex items-center gap-2 h-9 px-4 border-border/30 hover:border-border/50 hover:bg-card/40 backdrop-blur-sm rounded-lg"
              >
                <Sparkles size={14} />
                Try Again
              </Button>
              <Button 
                onClick={handleCreateNote} 
                size="sm"
                className="flex items-center gap-2 h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus size={14} />
                Create Note Instead
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Enhanced Header with Better Typography and Spacing */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Notes</h1>
            <p className="text-sm text-muted-foreground/80">
              Organize your thoughts and link them to PDF annotations
            </p>
            {/* Stats */}
            {notes.length > 0 && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground/70 mt-2">
                <div className="flex items-center gap-1">
                  <BookOpen size={12} />
                  <span>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Type size={12} />
                  <span>{totalWords.toLocaleString()} words</span>
                </div>
                <div className="flex items-center gap-1">
                  <PenTool size={12} />
                  <span>
                    {notes.filter(note => note.pdfAnnotationId).length} linked to PDFs
                  </span>
                </div>
              </div>
            )}
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

        {/* Enhanced Notes List with Modern Layout */}
        <EnhancedNotesList
          notes={notes}
          viewMode={viewMode}
          sortBy={sortBy}
          sortOrder={sortOrder}
          filterBy={filterBy}
          onCreateNote={handleCreateNote}
          onEditNote={handleEditNote}
          onViewAnnotation={handleViewPDFAnnotation}
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