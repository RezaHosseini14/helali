'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { login } from '@/features/auth/services/auth.service';
import { authKeys } from '@/features/auth/hooks/use-current-user';
import { useZodForm } from '@/lib/use-zod-form';
import { getApiErrorMessage } from '@/services/get-api-error-message';
import TextField from '@/components/global/fields/TextField';
import PasswordField from '@/components/global/fields/PasswordField';
import { Button } from '@/components/ui/button';
import { loginSchema, type ILoginFormValue } from 'models/login.model';

const LOGIN_DEFAULT_VALUES: ILoginFormValue = {
  username: '',
  password: '',
};

export function LoginForm() {
  const queryClient = useQueryClient();
  const { isPending, mutateAsync } = useMutation({ mutationFn: login });
  const { values, setFieldValue, handleBlur, submit, getFieldError } = useZodForm({
    schema: loginSchema,
    defaultValues: LOGIN_DEFAULT_VALUES,
  });

  const handleLogin = async (credentials: ILoginFormValue): Promise<void> => {
    try {
      await mutateAsync(credentials);
      await queryClient.invalidateQueries({ queryKey: authKeys.all });
      toast.success('با موفقیت وارد شدید');
      window.location.assign('/dashboard');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error) || 'ورود ناموفق بود');
    }
  };

  return (
    <div className="h-fit min-h-64 w-96 rounded-2xl border border-border bg-card shadow-lg">
      <form
        className="relative flex h-full flex-col gap-8 p-4"
        onSubmit={submit(handleLogin)}
        noValidate
      >
        <h1 className="absolute z-[60] -top-6 right-1/2 translate-x-1/2 rounded-xl bg-primary px-4 py-2 text-xl text-primary-foreground shadow-lg">
          ورود به سامانه
        </h1>

        <div className="mt-8 flex w-full flex-col gap-2">
          <TextField
            name="username"
            title="نام کاربری"
            autoComplete="username"
            containerClassName="col-span-6"
            value={values.username}
            error={getFieldError('username')}
            onBlur={() => handleBlur('username')}
            onChange={(value: string) => setFieldValue('username', value)}
          />

          <PasswordField
            name="password"
            title="رمز عبور"
            autoComplete="current-password"
            containerClassName="col-span-6"
            value={values.password}
            error={getFieldError('password')}
            onBlur={() => handleBlur('password')}
            onChange={(value: string) => setFieldValue('password', value)}
          />
        </div>

        <Button className="w-full font-bold" type="submit" size="lg" isLoading={isPending}>
          ورود
        </Button>
      </form>
    </div>
  );
}
