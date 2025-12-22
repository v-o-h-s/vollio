import {
  useCreateSummaryMutation,
  useGetSummariesByDocumentIdQuery,
  useUpdateSummaryMutation,
} from "@/lib/store/apiSlice";
import { useCallback, useMemo } from "react";

export const useSummaryActions = (documentId: string) => {
  const { data: summaries } = useGetSummariesByDocumentIdQuery(documentId);
  const [createSummary] = useCreateSummaryMutation();
  const [updateSummary] = useUpdateSummaryMutation();

  const summary = useMemo(() => {
    return summaries && summaries.length > 0 ? summaries[0] : null;
  }, [summaries]);

  const addMainPoint = useCallback(
    async (text: string) => {
      const currentMainPoints = summary?.mainPoints || [];

      // Avoid duplicates
      if (currentMainPoints.includes(text)) {
        console.log("Main point already exists");
        return;
      }

      const updatedMainPoints = [...currentMainPoints, text];

      if (summary) {
        await updateSummary({
          id: summary.id,
          mainPoints: updatedMainPoints,
        });
      } else {
        await createSummary({
          documentId,
          mainPoints: updatedMainPoints,
        });
      }
    },
    [documentId, summary, createSummary, updateSummary]
  );

  const removeMainPoint = useCallback(
    async (text: string) => {
      if (!summary) return;

      const updatedMainPoints = summary.mainPoints.filter(
        (point) => point !== text
      );

      await updateSummary({
        id: summary.id,
        mainPoints: updatedMainPoints,
      });
    },
    [summary, updateSummary]
  );

  return {
    summary,
    addMainPoint,
    removeMainPoint,
  };
};
