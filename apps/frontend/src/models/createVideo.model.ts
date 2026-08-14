import { z } from 'zod';

export const createVideoSchema = z.object({
  title: z.string().min(1, 'عنوان فایل صوتی الزامی است'),
  text: z.string().optional(),
});

export type ICreateVideoFormValue = z.infer<typeof createVideoSchema>;

/** @deprecated Use createVideoSchema */
export const createVideoModel = createVideoSchema;
