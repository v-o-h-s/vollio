import { z } from "zod";

// Schema for updating summaries
export const updateSummaryDtoSchema = z.object({
  mainPoints: z.array(z.string()).optional(),
  attributes: z.record(z.string(), z.any()).nullable().optional(),
});

export type UpdateSummaryDto = z.infer<typeof updateSummaryDtoSchema>;
