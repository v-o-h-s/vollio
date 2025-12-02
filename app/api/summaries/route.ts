import { createSummaryDtoSchema } from "@/lib/dto/createSummaryDto";
import { createSummaryHandler } from "./handlers/createSummary";
import { getSummaryHandler } from "./handlers/getSummary";
import { withErrorHandling } from "@/lib/wrappers/withErrorHandling";
import { withValidation } from "@/lib/wrappers/withValidation";

export const POST = withErrorHandling(
  withValidation(createSummaryDtoSchema, createSummaryHandler)
);

export const GET = withErrorHandling(getSummaryHandler);
