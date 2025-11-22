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

export const updateNoteDtoSchema = z.object({
  title: z.string().optional(),
  content: z.custom<JSONContent>().optional(),
});

export type UpdateNoteDto = z.infer<typeof updateNoteDtoSchema>;
