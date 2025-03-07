'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Form } from 'rsuite';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

//services
import { login } from 'services/auth/authServices';

//components
import TextField from '@/components/global/fields/TextField';
import PasswordField from '@/components/global/fields/PasswordField';
import { loginModel } from 'models/login.model';

function LoginPage() {
  type LoginType = {
    username: string;
    password: string;
  };

  const router = useRouter();
  const formRef = useRef<any>(undefined);
  const [formValue, setFormValue] = useState<LoginType>({ username: '', password: '' });
  const handleInputChange = (name: keyof LoginType, value: string) => {
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const { isPending, mutateAsync } = useMutation({ mutationFn: login });

  const handleSubmit = async () => {
    if (!formRef.current.check()) {
      return;
    } else {
      try {
        const res = await mutateAsync(formValue);
        if (res?.status == 200) {
          toast.success('با موفقیت وارد شدید');
          router.push('/dashboard');
        }
      } catch (error: any) {
        console.log(error?.response?.data?.message);
      }
    }
  };

  return (
    <div className="h-screen w-screen grid place-content-center bg-mainstructure">
      <div className="bg-maincolor shadow-lg w-96 h-fit min-h-64 rounded-xl">
        <Form
          model={loginModel}
          ref={formRef}
          fluid
          formValue={formValue}
          className="relative flex flex-col gap-8 h-full p-4"
          onSubmit={handleSubmit}
        >
          <h1 className="absolute text-xl right-1/2 translate-x-1/2 -top-6 bg-maincolor py-2 px-4 rounded-xl text-white shadow-lg z-[60]">
            ورود به سامانه
          </h1>

          <div className="flex flex-col gap-2 w-full mt-8">
            <TextField
              name="username"
              title="نام کاربری"
              containerClassName="col-span-6"
              value={formValue.username}
              onChange={(value: string) => handleInputChange('username', value)}
            />

            <PasswordField
              name="password"
              title="رمز عبور"
              containerClassName="col-span-6"
              value={formValue.password}
              onChange={(value: string) => handleInputChange('password', value)}
            />
          </div>

          <Button
            appearance="primary"
            color="blue"
            size="lg"
            className="font-bold"
            type="submit"
            block
            loading={isPending}
            disabled={isPending}
          >
            ورود
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default LoginPage;
