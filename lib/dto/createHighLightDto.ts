import { z } from "zod";

// Scaled rectangle schema
const scaledSchema = z.object({
  height: z.number(),
  pageNumber: z.number().int().positive(),
  width: z.number(),
  x1: z.number(),
  x2: z.number(),
  y1: z.number(),
  y2: z.number(),
});

// Scaled position schema
const scaledPositionSchema = z.object({
  boundingRect: scaledSchema,
  rects: z.array(scaledSchema),
  usePdfCoordinates: z.boolean().optional(),
});

// Content schema
const contentSchema = z.object({
  text: z.string().optional(),
  image: z.string().optional(),
});

// Main highlight schema for creation
export const createHighlightDtoSchema = z.object({
  id: z.string(),
  pdfId: z.string().uuid(),
  type: z.enum(["text", "area"]).optional(),
  content: contentSchema.optional(),
  position: scaledPositionSchema,
  color: z.string().optional(),
  hasNote: z.boolean().nullable().optional(),
  noteId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).optional(),
  style: z.enum(["highlight", "tagged"]).optional(),
});

export type CreateHighlightDto = z.infer<typeof createHighlightDtoSchema>;
