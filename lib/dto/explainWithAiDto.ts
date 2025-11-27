import { z } from "zod";

export const conceptSchema = z.object({
  concept: z.string(),
  explainType: z.enum(["shortly", "detailed"]),
});

export type ExplainWithAiDto = z.infer<typeof conceptSchema>;
