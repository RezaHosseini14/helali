import { z } from 'zod';

export const createAudioSchema = z.object({
  title: z.string().min(1, 'عنوان فایل صوتی الزامی است'),
  text: z.string().optional(),
  categories: z.array(z.number().int().positive()).min(1, 'انتخاب حداقل یک دسته‌بندی الزامی است'),
});

export type ICreateAudioFormValue = z.infer<typeof createAudioSchema>;

/** @deprecated Use createAudioSchema */
export const createAudioModel = createAudioSchema;
