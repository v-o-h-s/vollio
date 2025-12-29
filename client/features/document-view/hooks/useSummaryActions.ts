import {
  useCreateSummaryMutation,
  useGenerateSummaryMutation,
  useGetSummariesByDocumentIdQuery,
  useUpdateSummaryMutation,
} from "@/lib/store/apiSlice";
import { useCallback, useMemo } from "react";

export const useSummaryActions = (documentId: string) => {
  const { data: summaries, refetch } =
    useGetSummariesByDocumentIdQuery(documentId);

  const [generateSummaryMutation, { isLoading: isGenerating }] =
    useGenerateSummaryMutation();

  const summary = useMemo(() => {
    return summaries && summaries.length > 0 ? summaries[0] : null;
  }, [summaries]);

  const generateSummary = useCallback(async () => {
    try {
      await generateSummaryMutation({ documentId }).unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to generate summary:", error);
      throw error;
    }
  }, [documentId, generateSummaryMutation, refetch]);

  return {
    summary,
    generateSummary,
    isGenerating,
  };
};
