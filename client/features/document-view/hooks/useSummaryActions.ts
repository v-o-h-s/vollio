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

export const useSummaryActions = ({
  documentId,
  onSummaryNoteCreated,
}: UseSummaryActionsProps) => {
  const { data: summaries, refetch } = useGetSummariesByDocumentIdQuery(
    documentId,
    {
      skip: !documentId,
    }
  );

  const { data: notes } = useGetNotesQuery(undefined);

  const [generateSummaryMutation, { isLoading: isGenerating }] =
    useGenerateSummaryMutation();

  const [createNote] = useCreateNoteMutation();

  const summary = useMemo(() => {
    return summaries && summaries.length > 0 ? summaries[0] : null;
  }, [summaries]);

  // Check if a summary note already exists
  const summaryNote = useMemo(() => {
    return notes?.find(
      (note) =>
        note.documentId === documentId &&
        note.title?.toLowerCase() === "summary"
    );
  }, [notes, documentId]);

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
