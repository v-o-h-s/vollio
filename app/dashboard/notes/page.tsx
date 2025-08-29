"use client";

import React, { useState } from "react";
import { useGetNotesQuery } from "@/lib/store/apiSlice";
import { useRouter } from "next/navigation";
import { Plus, FileText, Sparkles, BookOpen, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useNoteSync } from "@/hooks/use-note-sync";
import { EnhancedNotesListSkeleton } from "@/components/ui/enhanced-notes-list-skeleton";
import { EnhancedNotesList } from "@/components/ui/enhanced-notes-list";

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
  
  const {
    data: notes = [],
    isLoading,
    error,
    refetch,
  } = useGetNotesQuery({});

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
    // TODO: Implement delete functionality with confirmation
    console.log('Delete note:', noteId);
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Notes</h1>
            <p className="text-muted-foreground text-lg">
              Organize your thoughts and link them to PDF annotations
            </p>
          </div>
          <Button 
            onClick={handleCreateNote} 
            className="flex items-center gap-2 px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-normal hover-lift"
          >
            <Plus size={18} />
            New Note
          </Button>
        </div>
        
        <EnhancedNotesListSkeleton count={8} viewMode={viewMode} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Notes</h1>
            <p className="text-muted-foreground text-lg">
              Organize your thoughts and link them to PDF annotations
            </p>
          </div>
          <Button 
            onClick={handleCreateNote} 
            className="flex items-center gap-2 px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-normal hover-lift bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={18} />
            New Note
          </Button>
        </div>
        
        <Card className="p-12 text-center border-2 border-dashed border-destructive/20 bg-destructive/5">
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
                className="flex items-center gap-2 px-6 py-3"
              >
                <Sparkles size={16} />
                Try Again
              </Button>
              <Button 
                onClick={handleCreateNote} 
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus size={16} />
                Create Note Instead
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header with Better Typography and Spacing */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Notes</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Organize your thoughts and link them to PDF annotations
            </p>
            {notes.length > 0 && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-3">
                <div className="flex items-center gap-1">
                  <BookOpen size={14} />
                  <span>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <PenTool size={14} />
                  <span>
                    {notes.filter(note => note.pdfAnnotationId).length} linked to PDFs
                  </span>
                </div>
              </div>
            )}
          </div>
          <Button 
            onClick={handleCreateNote} 
            className="flex items-center gap-2 px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-normal hover-lift bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus size={18} />
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
      </div>
    </ErrorBoundary>
  );
};

export default NotesPage;