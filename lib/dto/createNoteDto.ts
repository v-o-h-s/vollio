import { z } from "zod";

export type JSONContent = {
  type?: string;
  attrs?: Record<string, any>;
  content?: JSONContent[];
  marks?: {
    type: string;
    attrs?: Record<string, any>;
    [key: string]: any;
  }[];
  text?: string;
  [key: string]: any;
};

export const createNoteDtoSchema = z.object({
  title: z.string().optional().default("Untitled Note"),
  content: z.custom<JSONContent>(),
  pdfId: z.string().optional(),
});

export type CreateNoteDto = z.infer<typeof createNoteDtoSchema>;
