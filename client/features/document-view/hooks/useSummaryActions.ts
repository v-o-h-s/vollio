import {
  useCreateSummaryMutation,
  useGenerateSummaryMutation,
  useGetSummariesByDocumentIdQuery,
  useUpdateSummaryMutation,
  useCreateNoteMutation,
  useGetNotesQuery,
} from "@/lib/store/apiSlice";
import { useCallback, useMemo } from "react";
import { JSONContent } from "@tiptap/core";

interface UseSummaryActionsProps {
  documentId: string;
  onSummaryNoteCreated?: (noteId: string) => void;
}

/**
 * Manages the logic for generating and retrieving document summaries, 
 * including automatic creation of summary notes.
 */
export const useSummaryActions = ({
  documentId,
  onSummaryNoteCreated,
}: UseSummaryActionsProps) => {
  // Retrieves existing summaries for the current document
  const { data: summaries, refetch } = useGetSummariesByDocumentIdQuery(
    documentId,
    {
      skip: !documentId,
    }
  );

  // Retrieves all notes to check for existing summary notes
  const { data: notes } = useGetNotesQuery(undefined);

  // Mutation hooks for generating summaries and creating notes
  const [generateSummaryMutation, { isLoading: isGenerating }] =
    useGenerateSummaryMutation();

  const [createNote] = useCreateNoteMutation();

  /**
   * Provides the most recent summary for the document if available.
   */
  const summary = useMemo(() => {
    return summaries && summaries.length > 0 ? summaries[0] : null;
  }, [summaries]);

  /**
   * Searches through document notes to find one titled "Summary",
   * preventing duplicate summary notes.
   */
  const summaryNote = useMemo(() => {
    return notes?.find(
      (note) =>
        note.documentId === documentId &&
        note.title?.toLowerCase() === "summary"
    );
  }, [notes, documentId]);

  /**
   * Triggers the AI summarization process, updates the local summaries state,
   * and automatically creates a new "Summary" note with the generated text.
   */
  const generateSummary = useCallback(async () => {
    try {
      const result = await generateSummaryMutation({ documentId }).unwrap();
      await refetch();

      // Create a note with the summary content
      const summaryContent: JSONContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: result.text || "No summary generated",
              },
            ],
          },
        ],
      };

      const newNote = await createNote({
        title: "Summary",
        content: summaryContent,
        documentId: documentId,
      }).unwrap();

      // Notify parent that a summary note was created
      if (onSummaryNoteCreated && newNote.id) {
        onSummaryNoteCreated(newNote.id);
      }
    } catch (error) {
      console.error("Failed to generate summary:", error);
      throw error;
    }
  }, [
    documentId,
    generateSummaryMutation,
    refetch,
    createNote,
    onSummaryNoteCreated,
  ]);

  return {
    summary,
    summaryNote,
    generateSummary,
    isGenerating,
  };
};