import { z } from 'zod';

export const donateSchema = z.object({
  price: z.string().min(1, 'مبلغ الزامی است'),
});

export type IDonateFormValue = z.infer<typeof donateSchema>;

/** @deprecated Use donateSchema */
export const donateModel = donateSchema;
