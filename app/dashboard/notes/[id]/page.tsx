"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetNoteQuery, useUpdateNoteMutation, useDeleteNoteMutation } from "@/lib/store/apiSlice";
import { LazyNotionEditor } from "@/components/editor/LazyNotionEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  ExternalLink, 
  FileText,
  Calendar,
  RefreshCw 
} from "lucide-react";
import { JSONContent } from "@/lib/types";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { formatDistanceToNow } from "date-fns";
import { useNoteSync } from "@/hooks/use-note-sync";
import { NoteEditorSkeleton } from "@/components/ui/note-skeleton";
import { noteNotifications } from "@/lib/utils/note-notifications";

interface NotePageProps {
  params: {
    id: string;
  };
}

/**
 * Note Editing Page
 * 
 * Allows users to view and edit existing notes with the Notion-like editor.
 * Shows linked PDF annotation information and provides navigation.
 */
const NotePage: React.FC<NotePageProps> = ({ params }) => {
  const router = useRouter();
  const { id } = params;
  
  // State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<JSONContent>({
    type: "doc",
    content: [{ type: "paragraph" }],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Queries and mutations
  const {
    data: note,
    isLoading,
    error,
    refetch,
  } = useGetNoteQuery(id);
  
  const [updateNote] = useUpdateNoteMutation();
  const [deleteNote] = useDeleteNoteMutation();

  // Cross-tab synchronization
  const { broadcastUpdate, broadcastDelete } = useNoteSync({
    enableAutoNavigation: true,
    enableAutoUpdate: true,
  });

  // Initialize form data when note loads
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setHasUnsavedChanges(false);
    }
  }, [note]);

  // Track unsaved changes
  useEffect(() => {
    if (note) {
      const titleChanged = title !== note.title;
      const contentChanged = JSON.stringify(content) !== JSON.stringify(note.content);
      setHasUnsavedChanges(titleChanged || contentChanged);
    }
  }, [title, content, note]);

  const handleSave = async () => {
    if (!title.trim()) {
      noteNotifications.updateError("Please enter a title for your note");
      return;
    }

    setIsSaving(true);
    
    try {
      await updateNote({
        id,
        updates: {
          title: title.trim(),
          content,
        },
      }).unwrap();

      setHasUnsavedChanges(false);

      // Broadcast update to other tabs
      broadcastUpdate(id, {
        title: title.trim(),
        content,
      });

      noteNotifications.updateSuccess(title.trim());
    } catch (error) {
      console.error("Failed to update note:", error);
      noteNotifications.updateError();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    const loadingToast = noteNotifications.loading("Deleting note...");
    
    try {
      await deleteNote(id).unwrap();
      
      // Broadcast deletion to other tabs
      broadcastDelete(id);
      
      noteNotifications.dismiss(loadingToast);
      noteNotifications.deleteSuccess(title);
      router.push("/dashboard/notes");
    } catch (error) {
      console.error("Failed to delete note:", error);
      noteNotifications.dismiss(loadingToast);
      noteNotifications.deleteError();
      setIsDeleting(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to leave?")) {
        router.back();
      }
    } else {
      router.back();
    }
  };

  const handleViewPDFAnnotation = () => {
    if (note?.pdfAnnotationId) {
      // Navigate to the PDF with the annotation highlighted
      router.push(`/dashboard/annotations/${note.pdfAnnotationId}`);
    }
  };

  // Loading state
  if (isLoading) {
    return <NoteEditorSkeleton />;
  }

  // Error state
  if (error || !note) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft size={16} />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Note Not Found</h1>
        </div>
        
        <Card className="p-8 text-center">
          <FileText size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Failed to load note
          </h2>
          <p className="text-red-500 mb-4">
            The note could not be found or there was an error loading it.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw size={16} className="mr-2" />
              Retry
            </Button>
            <Button onClick={() => router.push("/dashboard/notes")}>
              Back to Notes
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Note</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>
                    Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </span>
                </div>
                {note.pdfAnnotationId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewPDFAnnotation}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 p-0 h-auto"
                  >
                    <ExternalLink size={12} />
                    <span>View PDF Annotation</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 size={16} />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges || !title.trim()}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {/* PDF Annotation Link Card */}
        {note.pdfAnnotationId && (
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">
                    Linked to PDF Annotation
                  </h3>
                  <p className="text-sm text-blue-700">
                    This note is connected to a PDF annotation
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewPDFAnnotation}
                className="flex items-center gap-2"
              >
                <ExternalLink size={14} />
                View in PDF
              </Button>
            </div>
          </Card>
        )}

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <Card className="p-3 mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-800">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium">You have unsaved changes</span>
            </div>
          </Card>
        )}

        {/* Note Editor */}
        <Card className="p-6">
          {/* Title Input */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Enter note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-semibold border-none px-0 focus:ring-0 focus:border-none"
              style={{ boxShadow: "none" }}
            />
          </div>

          {/* Rich Text Editor */}
          <LazyNotionEditor
            initialContent={content}
            onChange={setContent}
            placeholder="Start writing your note..."
            className="min-h-[400px]"
          />
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            <span>Use "/" to insert blocks and format text</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleBack}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges || !title.trim()}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default NotePage;