'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

//Functions
import { handleResponse } from 'utils/functions';

// Services
import { createCategory } from 'services/category/categoryServices';

// Components
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

export interface ICreateCategoryProps {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  message: string;
  title: string;
  confirmMsg: string;
  refetch: () => void;
}

export interface ICategoryFormValue {
  title: string;
  sort: number;
}

/** @deprecated Use ICreateCategoryProps */
export type CreateCategoryPropsType = ICreateCategoryProps;
/** @deprecated Use ICategoryFormValue */
export type CategoryFormValue = ICategoryFormValue;

function CreateCategoryModal(props: ICreateCategoryProps) {
  const [formValue, setFormValue] = useState<ICategoryFormValue>({
    title: '',
    sort: 0,
  });

  // ---------------------- Data Fetching ----------------------
  const { mutateAsync, isPending } = useMutation({
    mutationFn: createCategory,
  });

  // ---------------------- Handlers ----------------------
  const handleInputChange = (name: keyof ICategoryFormValue, value: string | number) => {
    if (name === 'sort' && value !== '') {
      value = Number(value);
    }
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formValue.title?.trim()) {
      toast.error('لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }

    try {
      const res = await mutateAsync(formValue);

      if (res?.status === 201) {
        props.refetch();
      }
      handleResponse(res, null, '', '');
    } catch (error) {
      handleResponse(null, error, '', 'مشکلی در ایجاد دسته‌بندی رخ داده است');
    }
  };

  // ---------------------- Render ----------------------
  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
        </DialogHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <DialogBody className="flex flex-col gap-4">
          <TextField
            name="title"
            title="عنوان"
            containerClassName="col-span-6"
            value={formValue.title}
            onChange={(value: string) => handleInputChange('title', value)}
          />

          <TextField
            name="sort"
            title="ترتیب"
            containerClassName="col-span-6"
            value={formValue.sort}
            onChange={(value: string) => handleInputChange('sort', value)}
            type="number"
          />
          </DialogBody>

          <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
            <Button type="submit" isLoading={isPending || props.loading}>
              {props.confirmMsg}
            </Button>
            <Button type="button" variant="subtle" onClick={props.onClose}>
              انصراف
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateCategoryModal;
