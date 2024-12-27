'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Form, Modal } from 'rsuite';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

//Functions
import { handleResponse } from 'utils/functions';

// Types
import { CategoryFormValue, CreateCategoryPropsType } from './CreateCategory.modal';

// Services
import { categoryById, updateCategoryById } from 'services/category/categoryServices';

// Components
import TextField from '@/components/global/fields/TextField';

function UpdateCategoryModal(props: CreateCategoryPropsType & { id: number }) {
  const formRef = useRef<any>();
  const [formValue, setFormValue] = useState<CategoryFormValue>({
    title: '',
    sort: 0,
  });

  // ---------------------- Data Fetching ----------------------
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['categoryById', props.id], // queryKey
    queryFn: () => categoryById(Number(props.id)), // queryFn
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
    mutationFn: (body: CategoryFormValue) => updateCategoryById(body, props.id),
  });

  // ---------------------- Handlers ----------------------

  const handleInputChange = (name: keyof CategoryFormValue, value: string | number) => {
    if (name === 'sort' && value !== '') {
      value = Number(value);
    }
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formRef.current.check()) {
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
    <Modal open={props.open} onClose={props.onClose} size="xs">
      <Modal.Header>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form formValue={formValue} ref={formRef} fluid>
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
        </Form>
      </Modal.Body>
      <div className="flex items-center justify-between">
        <Button onClick={handleSubmit} appearance="primary" color="blue" loading={isFetching || isPending}>
          {props.confirmMsg}
        </Button>
        <Button onClick={props.onClose} appearance="subtle">
          انصراف
        </Button>
      </div>
    </Modal>
  );
}

export default UpdateCategoryModal;
