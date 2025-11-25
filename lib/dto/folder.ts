import { z } from 'zod';

export const createFolderSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    parent_id: z.string().nullable().optional(),
});


export type CreateFolderDto = z.infer<typeof createFolderSchema>;