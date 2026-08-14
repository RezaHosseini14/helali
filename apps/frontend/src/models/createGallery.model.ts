import { z } from 'zod';

export const createGallerySchema = z.object({
  desc: z.string().min(1, 'توضیحات فایل صوتی الزامی است'),
});

export type ICreateGalleryFormValue = z.infer<typeof createGallerySchema>;

/** @deprecated Use createGallerySchema */
export const createGalleryModel = createGallerySchema;
