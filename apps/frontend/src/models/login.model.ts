import { z } from 'zod';

const LOGIN_USERNAME_MAX_LENGTH = 64;
const LOGIN_PASSWORD_MAX_LENGTH = 128;

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'نام کاربری الزامی است')
    .max(LOGIN_USERNAME_MAX_LENGTH, `نام کاربری نباید بیشتر از ${LOGIN_USERNAME_MAX_LENGTH} نویسه باشد`),
  password: z
    .string()
    .min(1, 'رمز عبور الزامی است')
    .max(LOGIN_PASSWORD_MAX_LENGTH, `رمز عبور نباید بیشتر از ${LOGIN_PASSWORD_MAX_LENGTH} نویسه باشد`),
});

export type ILoginFormValue = z.infer<typeof loginSchema>;

/** @deprecated Use loginSchema */
export const loginModel = loginSchema;
