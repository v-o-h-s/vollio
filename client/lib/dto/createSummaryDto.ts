import { z } from "zod";

// Main summary schema for creation
export const createSummaryDtoSchema = z.object({
  pdfId: z.string().uuid(),
  mainPoints: z.array(z.string()).optional(),
  attributes: z.record(z.string(), z.any()).nullable().optional(),
});

export type CreateSummaryDto = z.infer<typeof createSummaryDtoSchema>;
