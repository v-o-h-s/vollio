"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetNotesQuery } from "@/lib/store/apiSlice";
import { RefreshCw, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AnnotationPageProps {
  params: {
    id: string;
  };
}

/**
 * Annotation Bridge Page
 * 
 * This page handles the bridge between PDF annotations and notes.
 * It finds the note linked to an annotation and redirects to it,
 * or provides options to create a new note if none exists.
 */
const AnnotationPage: React.FC<AnnotationPageProps> = ({ params }) => {
  const router = useRouter();
  const { id: annotationId } = params;
  
  // Get notes linked to this annotation
  const {
    data: notes = [],
    isLoading,
    error,
  } = useGetNotesQuery({ pdfAnnotationId: annotationId });

  useEffect(() => {
    if (!isLoading && notes.length > 0) {
      // If we found a linked note, redirect to it
      const linkedNote = notes[0]; // Should only be one note per annotation
      router.replace(`/dashboard/notes/${linkedNote.id}`);
    }
  }, [notes, isLoading, router]);

  const handleCreateNote = () => {
    // Create a new note linked to this annotation
    // We'll need to pass the annotation ID so the note can be linked
    router.push(`/dashboard/notes/new?annotationId=${annotationId}`);
  };

  const handleBackToPDF = () => {
    // Navigate back to the PDF viewer
    // We'd need to know which PDF this annotation belongs to
    router.back();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-8 text-center">
          <RefreshCw size={32} className="text-blue-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Finding linked note...
          </h2>
          <p className="text-gray-600">
            Looking for notes connected to this annotation
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-8 text-center">
          <FileText size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error loading annotation
          </h2>
          <p className="text-red-500 mb-4">
            There was an error finding the note for this annotation.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={handleBackToPDF} variant="outline">
              Back to PDF
            </Button>
            <Button onClick={handleCreateNote}>
              Create New Note
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // If no linked note found, show options to create one
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="p-8 text-center">
        <FileText size={48} className="text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No note found for this annotation
        </h2>
        <p className="text-gray-600 mb-6">
          This annotation doesn't have a linked note yet. Would you like to create one?
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={handleBackToPDF} variant="outline">
            Back to PDF
          </Button>
          <Button onClick={handleCreateNote} className="flex items-center gap-2">
            <Plus size={16} />
            Create Note
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AnnotationPage;