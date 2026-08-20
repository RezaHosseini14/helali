'use client';

import { useEffect, useMemo, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import type { IRole } from '@helali/shared';

import TextField from '@/components/global/fields/TextField';
import SelectField from '@/components/global/fields/SelectField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getRoleLabel } from '@/features/roles/utils/authorization-labels';
import { getSchemaErrorMessage } from '@/lib/validate-schema';
import { registerModel, type IRegisterFormValue } from 'models/register.model';
import { apiClient, unwrapApiResponse } from '@/services/api-client';
import { registerUser } from 'services/auth/authServices';
import { handleResponse } from 'utils/functions';

interface ICreateUserModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly refetch: () => void;
}

const EMPTY_FORM: IRegisterFormValue = {
  username: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  roleId: 0,
  age: undefined,
  email: undefined,
};

async function fetchAssignableRoles(): Promise<ReadonlyArray<IRole>> {
  return unwrapApiResponse(apiClient.get('/users/roles'));
}

export default function CreateUserModal({ open, onClose, refetch }: ICreateUserModalProps) {
  const [formValue, setFormValue] = useState<IRegisterFormValue>(EMPTY_FORM);

  const { data: roles = [], isLoading: isRolesLoading } = useQuery({
    queryKey: ['assignable-roles'],
    queryFn: fetchAssignableRoles,
    enabled: open,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: registerUser,
  });

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        label: getRoleLabel(role.name),
        value: role.id,
      })),
    [roles],
  );

  useEffect(() => {
    if (open && roles.length > 0 && !formValue.roleId) {
      setFormValue((prev) => ({ ...prev, roleId: roles[0]!.id }));
    }
  }, [open, roles, formValue.roleId]);

  function handleInputChange(
    name: keyof IRegisterFormValue,
    value: string | number | undefined,
  ): void {
    if (name === 'age' && value !== '' && value !== undefined) {
      value = Number(value);
    }
    if (name === 'roleId' && value !== '' && value !== undefined) {
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
              name="firstName"
              title="نام"
              containerClassName="col-span-6"
              value={formValue.firstName}
              onChange={(value: string) => handleInputChange('firstName', value)}
            />
            <TextField
              name="lastName"
              title="نام خانوادگی"
              containerClassName="col-span-6"
              value={formValue.lastName}
              onChange={(value: string) => handleInputChange('lastName', value)}
            />
            <TextField
              name="phoneNumber"
              title="تلفن همراه"
              containerClassName="col-span-6"
              value={formValue.phoneNumber}
              onChange={(value: string) => handleInputChange('phoneNumber', value)}
            />
            <SelectField
              name="roleId"
              title="نقش"
              containerClassName="col-span-6"
              data={roleOptions}
              value={formValue.roleId || null}
              onChange={(value) =>
                handleInputChange('roleId', value ? Number(value) : undefined)
              }
              loading={isRolesLoading}
              placeholder="انتخاب نقش"
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
