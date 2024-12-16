'use client';
import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Form, Loader } from 'rsuite';
import { useMutation } from '@tanstack/react-query';
//services
import { login } from 'services/auth/authServices';
import TextField from '@/components/global/fields/TextField';
import { loginModel } from 'models/login.model';
import toast from 'react-hot-toast';

function LoginPage() {
  type LoginType = {
    username: string;
    password: string;
  };

  const router = useRouter();
  const formRef = useRef<any>();
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
    <div className="h-screen w-screen grid place-content-center">
      <div className="bg-mainColor/30 border border-mainColor shadow-lg w-96 h-fit min-h-64 rounded-xl">
        {isPending ? (
          <Loader center size="lg" />
        ) : (
          <Form
            model={loginModel}
            ref={formRef}
            fluid
            formValue={formValue}
            className="relative flex flex-col gap-8 h-full p-4"
          >
            <h1 className="absolute text-xl right-1/2 translate-x-1/2 -top-6 bg-mainColor py-2 px-4 rounded-xl text-white">
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

              <TextField
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
              onClick={handleSubmit}
              block
              loading={isPending}
              disabled={isPending}
            >
              ورود
            </Button>
          </Form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
