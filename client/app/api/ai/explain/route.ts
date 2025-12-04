import { withErrorHandling } from "@/lib/wrappers/withErrorHandling";
import { withValidation } from "@/lib/wrappers/withValidation";
import { explainHandler } from "./handlers/explain";
import { conceptSchema } from "@/lib/dto/explainWithAiDto";

export const POST = withErrorHandling(withValidation(conceptSchema,explainHandler));
