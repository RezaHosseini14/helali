'use client';

import { useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import TextField from '@/components/global/fields/TextField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getSchemaErrorMessage } from '@/lib/validate-schema';
import { registerModel } from 'models/register.model';
import { registerUser } from 'services/auth/authServices';
import { handleResponse } from 'utils/functions';

export interface IRegisterFormValue {
  username: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  age?: number;
  email?: string;
}

interface ICreateUserModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly refetch: () => void;
}

const EMPTY_FORM: IRegisterFormValue = {
  username: '',
  password: '',
  confirmPassword: '',
  first_name: '',
  last_name: '',
  phone_number: '',
  age: undefined,
  email: undefined,
};

export default function CreateUserModal({ open, onClose, refetch }: ICreateUserModalProps) {
  const [formValue, setFormValue] = useState<IRegisterFormValue>(EMPTY_FORM);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: registerUser,
  });

  function handleInputChange(name: keyof IRegisterFormValue, value: string | number | undefined): void {
    if (name === 'age' && value !== '' && value !== undefined) {
      value = Number(value);
    }
    setFormValue((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(): Promise<void> {
    const error = getSchemaErrorMessage(registerModel, formValue);
    if (error || formValue.password !== formValue.confirmPassword) {
      toast.error(error || 'لطفاً تمام فیلدهای ضروری را پر کنید یا رمز عبور مطابقت ندارد');
      return;
    }

    try {
      const res = await mutateAsync(formValue);
      if (res?.status === 201 || res?.status === 200) {
        setFormValue(EMPTY_FORM);
        refetch();
        onClose();
      }
      handleResponse(res, null, '', '');
    } catch (error) {
      toast.error('ثبت کاربر با مشکل مواجه شد');
      handleResponse(null, error, '', 'مشکلی در ثبت کاربر رخ داده است');
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>ثبت‌نام کاربر جدید</DialogTitle>
        </DialogHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <DialogBody>
            <div className="grid grid-cols-12 gap-4">
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
              onChange={(value) =>
                handleInputChange('age', value === '' ? undefined : Number(value))
              }
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
          </DialogBody>
          <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
            <Button type="submit" isLoading={isPending}>
              ثبت‌نام
            </Button>
            <Button type="button" variant="subtle" onClick={onClose}>
              انصراف
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
