import { z } from "zod";

// Quiz Creation Schema
export const quizCreationSchema = z.object({
  documentId: z.string().min(1, "Please select a document"),
  userPrompt: z
    .string()
    .max(1000, "Prompt must be at most 1000 characters long")
    .optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  numberOfQuestions: z
    .number()
    .min(1, "Must have at least 1 question")
    .max(50, "Maximum 50 questions allowed"),
  language: z.enum(["en", "fr", "es", "ar"]),
  timeLimitMinutes: z.number().min(1).max(180).optional(),
  explanationLevel: z.enum(["none", "brief", "detailed"]),
  questionsDistribution: z
    .object({
      MCQ: z.number().min(0).max(50).optional(),
      TRUE_FALSE: z.number().min(0).max(50).optional(),
    })
    .optional(),
});

export type QuizCreationFormData = z.infer<typeof quizCreationSchema>;
