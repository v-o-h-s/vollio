import { withErrorHandling } from "@/lib/wrappers/withErrorHandling";
import { withValidation } from "@/lib/wrappers/withValidation";
import { createHighlightDtoSchema } from "@/lib/dto/createHighLightDto";
import { updateHighlightHandler } from "../handlers/updateHighlight";
import { deleteHighlightHandler } from "../handlers/deleteHighlight";

export const PATCH = withErrorHandling(
  withValidation(createHighlightDtoSchema.partial(), updateHighlightHandler)
);

export const DELETE = withErrorHandling(deleteHighlightHandler);
