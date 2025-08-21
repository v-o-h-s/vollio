"use client";

import React from "react";
import { useGetNotesQuery } from "@/lib/store/apiSlice";
import { useRouter } from "next/navigation";
import { Plus, FileText, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-20 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
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
              <Card
                key={note.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleEditNote(note.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {note.title}
                  </h3>
                  {note.pdfAnnotationId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPDFAnnotation(note.pdfAnnotationId!);
                      }}
                      className="flex-shrink-0 ml-2"
                    >
                      <ExternalLink size={14} />
                    </Button>
                  )}
                </div>
                
                {/* Note content preview */}
                <div className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {note.content?.content?.[0]?.content?.[0]?.text || "Empty note"}
                </div>
                
                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>
                      {formatDistanceToNow(new Date(note.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  
                  {note.pdfAnnotationId && (
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                      Linked to PDF
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default NotesPage;