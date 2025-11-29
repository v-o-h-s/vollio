import { withErrorHandling } from "@/lib/wrappers/withErrorHandling";
import { withValidation } from "@/lib/wrappers/withValidation";
import { createHighlightHandler } from "./handlers/createHighlight";
import { createHighlightDtoSchema } from "@/lib/dto/createHighLightDto";

export const POST = withErrorHandling(
  withValidation(createHighlightDtoSchema, createHighlightHandler)
);
