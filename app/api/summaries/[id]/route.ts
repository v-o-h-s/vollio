import { updateSummaryDtoSchema } from "@/lib/dto/updateSummaryDto";
import { updateSummaryHandler } from "../handlers/updateSummary";
import { withErrorHandling } from "@/lib/wrappers/withErrorHandling";
import { withValidation } from "@/lib/wrappers/withValidation";

export const PATCH = withErrorHandling(
  withValidation(updateSummaryDtoSchema, updateSummaryHandler)
);
