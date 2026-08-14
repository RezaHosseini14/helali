import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(1, 'نام کاربری الزامی است'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
  confirmPassword: z.string().min(1, 'تکرار رمز عبور الزامی است'),
  first_name: z.string().min(1, 'نام الزامی است'),
  last_name: z.string().min(1, 'نام خانوادگی الزامی است'),
  phone_number: z.string().min(1, 'تلفن همراه الزامی است'),
  age: z.coerce.number().min(18, 'سن باید حداقل 18 باشد').optional(),
  email: z.string().email('ایمیل وارد شده معتبر نیست').optional().or(z.literal('')),
});

export type IRegisterFormValue = z.infer<typeof registerSchema>;

/** @deprecated Use registerSchema */
export const registerModel = registerSchema;
