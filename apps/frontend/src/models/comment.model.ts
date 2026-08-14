import { z } from 'zod';

export const commentSchema = z.object({
  author: z.string().min(1, 'نام و نام‌خانوادگی الزامی است'),
  text: z.string().min(1, 'دیدگاه الزامی است'),
});

export type ICommentFormValue = z.infer<typeof commentSchema>;

/** @deprecated Use commentSchema */
export const commentModel = commentSchema;
