import {
  useCreateOrUpdateSummaryMutation,
  useGetSummaryByPdfIdQuery,
} from "@/lib/store/apiSlice";
import { useCallback } from "react";

export const useSummaryActions = (pdfId: string) => {
  const { data: summary } = useGetSummaryByPdfIdQuery(pdfId);
  const [createOrUpdateSummary] = useCreateOrUpdateSummaryMutation();

  const addMainPoint = useCallback(
    async (text: string) => {
      const currentMainPoints = summary?.mainPoints || [];

      // Avoid duplicates
      if (currentMainPoints.includes(text)) {
        console.log("Main point already exists");
        return;
      }

      const updatedMainPoints = [...currentMainPoints, text];

      await createOrUpdateSummary({
        pdfId,
        mainPoints: updatedMainPoints,
        attributes: summary?.attributes || null,
      });
    },
    [pdfId, summary, createOrUpdateSummary]
  );

  const removeMainPoint = useCallback(
    async (text: string) => {
      if (!summary) return;

      const updatedMainPoints = summary.mainPoints.filter(
        (point) => point !== text
      );

      await createOrUpdateSummary({
        pdfId,
        mainPoints: updatedMainPoints,
        attributes: summary.attributes,
      });
    },
    [pdfId, summary, createOrUpdateSummary]
  );

  return {
    summary,
    addMainPoint,
    removeMainPoint,
  };
};
