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
    title: z.string().min(1, "Title is required"),
    content: z.custom<JSONContent>(),
    });

export type CreateNoteDto = z.infer<typeof createNoteDtoSchema>;
