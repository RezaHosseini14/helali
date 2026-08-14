'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

//Functions
import { handleResponse } from 'utils/functions';

// Types
import {
  type ICategoryFormValue,
  type ICreateCategoryProps,
} from './CreateCategory.modal';

// Services
import { categoryById, updateCategoryById } from 'services/category/categoryServices';

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

function UpdateCategoryModal(props: ICreateCategoryProps & { id: number }) {
  const [formValue, setFormValue] = useState<ICategoryFormValue>({
    title: '',
    sort: 0,
  });

  // ---------------------- Data Fetching ----------------------
  const { data, isFetching } = useQuery({
    queryKey: ['categoryById', props.id],
    queryFn: () => categoryById(Number(props.id)),
    enabled: !!props.id,
    staleTime: 0,
  });

  // ---------------------- useEffect ----------------------
  useEffect(() => {
    if (data) {
      setFormValue({
        title: data?.data?.category?.title || '',
        sort: data?.data?.category?.sort || 0,
      });
    }
  }, [data]);

  // ---------------------- Mutations ----------------------
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['updateCategoryById'],
    mutationFn: (body: ICategoryFormValue) => updateCategoryById(body, props.id),
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

    const hasChanges = formValue.title !== data?.data?.category?.title || formValue.sort !== data?.data?.category?.sort;

    if (!hasChanges) {
      toast.error('تغییری اعمال نشده است');
      return;
    }

    try {
      const res = await mutateAsync({
        title: formValue.title,
        sort: formValue.sort,
      });

      if (res?.status === 200) {
        props.refetch();
        props.onClose();
      }
      handleResponse(res, null, '', '');
    } catch (error) {
      handleResponse(null, error, '', 'مشکلی در به‌روزرسانی دسته‌بندی رخ داده است');
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
            <Button type="submit" isLoading={isFetching || isPending}>
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

export default UpdateCategoryModal;
