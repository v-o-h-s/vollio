"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateNoteMutation } from "@/lib/store/apiSlice";
import { LazyNotionEditor } from "@/components/editor/LazyNotionEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { JSONContent } from "@/lib/types";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useNoteSync } from "@/hooks/use-note-sync";
import { noteNotifications } from "@/lib/utils/note-notifications";

/**
 * Interface for PDF selection data passed via URL params
 */
interface PDFSelectionData {
  text: string;
  pageNumber: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  pdfId: string;
  pdfFilename: string;
}

/**
 * New Note Creation Page
 * 
 * Allows users to create new notes with the Notion-like editor.
 * Can be initialized with PDF annotation data for linked notes.
 */
const NewNotePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState<JSONContent>({
    type: "doc",
    content: [{ type: "paragraph" }],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [selectionData, setSelectionData] = useState<PDFSelectionData | null>(null);

  // Mutations
  const [createNote] = useCreateNoteMutation();

  // Cross-tab synchronization
  const { broadcastCreate } = useNoteSync();

  // Parse selection data from URL params if present
  useEffect(() => {
    const selectionParam = searchParams.get("selection");
    const annotationId = searchParams.get("annotationId");
    
    if (selectionParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(selectionParam)) as PDFSelectionData;
        setSelectionData(parsed);
        
        // Set initial title based on PDF selection
        setTitle(`Note from ${parsed.pdfFilename}`);
        
        // Set initial content with the selected text
        setContent({
          type: "doc",
          content: [
            {
              type: "blockquote",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: parsed.text,
                    },
                  ],
                },
              ],
            },
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: `From page ${parsed.pageNumber} of ${parsed.pdfFilename}`,
                  marks: [{ type: "italic" }],
                },
              ],
            },
            {
              type: "paragraph",
            },
          ],
        });
      } catch (error) {
        console.error("Failed to parse selection data:", error);
      }
    } else if (annotationId) {
      // If we have an annotation ID, set up the note to be linked to it
      setTitle("Note for PDF Annotation");
      setContent({
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This note is linked to a PDF annotation.",
                marks: [{ type: "italic" }],
              },
            ],
          },
          {
            type: "paragraph",
          },
        ],
      });
    }
  }, [searchParams]);

  const handleSave = async () => {
    if (!title.trim()) {
      noteNotifications.createError("Please enter a title for your note");
      return;
    }

    setIsSaving(true);
    const loadingToast = noteNotifications.loading("Creating note...");
    
    try {
      const annotationId = searchParams.get("annotationId");
      
      const result = await createNote({
        title: title.trim(),
        content,
        pdfAnnotationId: annotationId || undefined,
      }).unwrap();

      // Broadcast creation to other tabs
      broadcastCreate(result);

      // If we have selection data, we need to create an annotation
      if (selectionData) {
        // TODO: Create annotation and link it to the note
        // This would involve calling the annotations API
        console.log("TODO: Create annotation for selection:", selectionData);
      }

      noteNotifications.dismiss(loadingToast);
      noteNotifications.createSuccess(title.trim());
      router.push(`/dashboard/notes/${result.id}`);
    } catch (error) {
      console.error("Failed to create note:", error);
      noteNotifications.dismiss(loadingToast);
      noteNotifications.createError();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">New Note</h1>
              {selectionData && (
                <p className="text-sm text-gray-600">
                  Creating note from PDF selection
                </p>
              )}
            </div>
          </div>
          
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex items-center gap-2"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save Note"}
          </Button>
        </div>

        {/* Selection Info Card */}
        {selectionData && (
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <FileText size={20} className="text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-1">
                  PDF Selection
                </h3>
                <p className="text-sm text-blue-700 mb-2">
                  From page {selectionData.pageNumber} of {selectionData.pdfFilename}
                </p>
                <blockquote className="text-sm text-blue-800 italic border-l-2 border-blue-300 pl-3">
                  "{selectionData.text}"
                </blockquote>
              </div>
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
            {selectionData ? (
              <span>This note will be linked to your PDF annotation</span>
            ) : (
              <span>Use "/" to insert blocks and format text</span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !title.trim()}
              className="flex items-center gap-2"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save Note"}
            </Button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default NewNotePage;