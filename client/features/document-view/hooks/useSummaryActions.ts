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

  return {
    summary,
  };
};
