import z from "zod";
// Flashcard Creation Schema (Manual Mode)

export const flashcardManualSchema = z.object({
  title: z.string().min(1, "Deck title is required"),
  description: z.string().optional(),
  language: z.enum(["en", "fr", "ar"]).default("en"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Medium"),
  documentId: z.string().min(1, "Please select a linked document"),
  tags: z.array(z.string()).optional().default([]),
  flashcards: z
    .array(
      z.object({
        id: z.string(),
        front: z.string().min(1, "Front content is required"),
        back: z.string().min(1, "Back content is required"),
        hint: z.string().optional(),
      })
    )
    .min(1, "At least one flashcard is required"),
});

export type FlashcardManualFormData = z.infer<typeof flashcardManualSchema>;

// Flashcard Auto Generation Schema
export const flashcardAutoSchema = z.object({
  documentId: z.string().min(1, "Please select a source document"),
  numberOfCards: z
    .number()
    .min(1, "Must generate at least 1 card")
    .max(50, "Maximum 50 cards allowed")
    .default(10),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Medium"),
  includeHints: z.boolean().default(true),
});

export type FlashcardAutoFormData = z.infer<typeof flashcardAutoSchema>;
