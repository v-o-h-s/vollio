import { z } from "zod";

// Quiz Creation Schema
export const quizCreationSchema = z.object({
  documentId: z.string().max(1, "Only one document can be selected"),
  userPrompt: z
    .string()
    .max(1000, "Prompt must be at most 1000 characters long")
    .optional(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  numberOfQuestions: z
    .number()
    .min(1, "Must have at least 1 question")
    .max(44, "Maximum 44 questions allowed"),
  language: z.enum(["en", "fr", "ar"]),
  timeLimitMinutes: z.number().min(1).max(60),
  explanationLevel: z.enum(["none", "brief", "detailed"]),
  questionsDistribution: z
    .object({
      MCQ: z.number().min(0).max(44),
      TRUE_FALSE: z.number().min(0).max(44),
    })
    .optional(),
});

export type QuizCreationFormData = z.infer<typeof quizCreationSchema>;
