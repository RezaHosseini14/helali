'use client';

import { useRef, useState } from 'react';
import { Button, Form, Modal } from 'rsuite';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

//Functions
import { handleResponse } from 'utils/functions';

// Services
import { createCategory } from 'services/category/categoryServices';

// Components
import TextField from '@/components/global/fields/TextField';

export type CreateCategoryPropsType = {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  message: string;
  title: string;
  confirmMsg: string;
  refetch: any;
};

export type CategoryFormValue = {
  title: string;
  sort: number;
};

function CreateCategoryModal(props: CreateCategoryPropsType) {
  const formRef = useRef<any>();
  const [formValue, setFormValue] = useState<CategoryFormValue>({
    title: '',
    sort: 0,
  });

  // ---------------------- Data Fetching ----------------------
  const { mutateAsync, isPending } = useMutation({
    mutationFn: createCategory,
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
        <Button onClick={handleSubmit} appearance="primary" color="blue" loading={props.loading}>
          {props.confirmMsg}
        </Button>
        <Button onClick={props.onClose} appearance="subtle">
          انصراف
        </Button>
      </div>
    </Modal>
  );
}

export default CreateCategoryModal;
