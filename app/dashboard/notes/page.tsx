"use client";

import React from "react";
import { useGetNotesQuery } from "@/lib/store/apiSlice";
import { useRouter } from "next/navigation";
import { Plus, FileText, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useNoteSync } from "@/hooks/use-note-sync";
import { NoteListSkeleton } from "@/components/ui/note-skeleton";
import { NoteCard } from "@/components/ui/note-card";

/**
 * Notes List Page
 * 
 * Displays all user notes with options to create, edit, and view notes.
 * Integrates with the PDF annotation system to show linked notes.
 */
const NotesPage: React.FC = () => {
  const router = useRouter();
  
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
          <Button onClick={handleCreateNote} className="flex items-center gap-2">
            <Plus size={16} />
            New Note
          </Button>
        </div>
        
        <NoteListSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
          <Button onClick={handleCreateNote} className="flex items-center gap-2">
            <Plus size={16} />
            New Note
          </Button>
        </div>
        
        <Card className="p-8 text-center">
          <FileText size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Failed to load notes
          </h2>
          <p className="text-red-500 mb-4">
            There was an error loading your notes. Please try again.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
            <p className="text-gray-600 mt-1">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </p>
          </div>
          <Button onClick={handleCreateNote} className="flex items-center gap-2">
            <Plus size={16} />
            New Note
          </Button>
        </div>

        {notes.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText size={64} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              No notes yet
            </h2>
            <p className="text-gray-500 mb-6">
              Create your first note to get started with rich text editing and PDF annotation linking.
            </p>
            <Button onClick={handleCreateNote} className="flex items-center gap-2">
              <Plus size={16} />
              Create your first note
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onViewAnnotation={handleViewPDFAnnotation}
              />
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default NotesPage;