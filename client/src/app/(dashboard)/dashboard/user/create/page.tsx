'use client';

import { useRef, useState } from 'react';
import { Button, Form } from 'rsuite';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

//Functions
import { handleResponse } from 'utils/functions';

// Models
import { registerModel } from 'models/register.model';

// Services
import { registerUser } from 'services/auth/authServices';

// Components
import DashboardPanel from '@/components/global/DashboardPanel';
import TextField from '@/components/global/fields/TextField';

export type RegisterFormValue = {
  username: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  age?: number;
  email?: string;
};

function CreateUserPage() {
  const formRef = useRef<any>();
  const [formValue, setFormValue] = useState<RegisterFormValue>({
    username: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    age: undefined,
    email: undefined,
  });

  // ---------------------- Data Fetching ----------------------
  const { mutateAsync, isPending } = useMutation({
    mutationFn: registerUser,
  });

  // ---------------------- Handlers ----------------------
  const handleInputChange = (name: keyof RegisterFormValue, value: string | number) => {
    if (name === 'age' && value !== '') {
      value = Number(value);
    }
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formRef.current.check() || formValue.password !== formValue.confirmPassword) {
      toast.error('لطفاً تمام فیلدهای ضروری را پر کنید یا رمز عبور مطابقت ندارد');
      return;
    }

    try {
      const res = await mutateAsync(formValue);
      handleResponse(res, null, '', '');
    } catch (error) {
      toast.error('ثبت کاربر با مشکل مواجه شد');
      handleResponse(null, error, '', 'مشکلی در ثبت کاربر رخ داده است');
    }
  };

  // ---------------------- Render ----------------------
  return (
    <DashboardPanel title="ثبت‌نام کاربر جدید">
      <Form model={registerModel} formValue={formValue} ref={formRef} fluid>
        <div className="grid grid-cols-12 gap-4 mb-4">
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
            type="password"
          />

          <TextField
            name="confirmPassword"
            title="تکرار رمز عبور"
            containerClassName="col-span-6"
            value={formValue.confirmPassword}
            onChange={(value: string) => handleInputChange('confirmPassword', value)}
            type="password"
          />

          <TextField
            name="first_name"
            title="نام"
            containerClassName="col-span-6"
            value={formValue.first_name}
            onChange={(value: string) => handleInputChange('first_name', value)}
          />

          <TextField
            name="last_name"
            title="نام خانوادگی"
            containerClassName="col-span-6"
            value={formValue.last_name}
            onChange={(value: string) => handleInputChange('last_name', value)}
          />

          <TextField
            name="phone_number"
            title="تلفن همراه"
            containerClassName="col-span-6"
            value={formValue.phone_number}
            onChange={(value: string) => handleInputChange('phone_number', value)}
          />

          <TextField
            name="age"
            title="سن (اختیاری)"
            containerClassName="col-span-6"
            value={formValue.age ?? ''}
            onChange={(value: number) => handleInputChange('age', value)}
            type="number"
          />

          <TextField
            name="email"
            title="ایمیل (اختیاری)"
            containerClassName="col-span-6"
            value={formValue.email}
            onChange={(value: string) => handleInputChange('email', value)}
            type="email"
          />
        </div>
        <Button appearance="primary" onClick={handleSubmit} loading={isPending}>
          ثبت‌نام
        </Button>
      </Form>
    </DashboardPanel>
  );
}

export default CreateUserPage;
