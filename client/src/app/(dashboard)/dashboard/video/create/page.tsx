'use client';
import React, { useRef, useState } from 'react';
import { Button, Form } from 'rsuite';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

//Functions
import { handleResponse } from 'utils/functions';

//Model
import { createVideoModel } from 'models/createVideo.model';

//Types
import { categoryType } from 'types/category.type';

//Services
import { uploadVideo } from 'services/video/videoServices';

//Components
import DashboardPanel from '@/components/global/DashboardPanel';
import TexAreaField from '@/components/global/fields/TexAreaField';
import TextField from '@/components/global/fields/TextField';
import UploadField from '@/components/global/fields/UploadField';
import TagField from '@/components/global/fields/TagField';
import { allCategory } from 'services/category/categoryServices';

type videoFormValue = {
  title: string;
  text?: string;
  file?: File | null;
  poster?: File | null;
  categories?: categoryType[];
};

function CreateVideoPage() {
  // ---------------------- State and Ref ----------------------
  const formRef = useRef<any>(undefined);
  const [formValue, setFormValue] = useState<videoFormValue>({
    title: '',
    text: '',
    file: null,
    poster: null,
    categories: [],
  });

  // ---------------------- Mutations ----------------------
  const { data, isLoading } = useQuery({
    queryKey: ['allCategory'],
    queryFn: () => allCategory(),
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: uploadVideo,
  });

  // ---------------------- Event Handlers ----------------------
  const handleInputChange = (name: keyof videoFormValue, value: string | categoryType[]) => {
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (name: keyof videoFormValue, fileList: any[]) => {
    setFormValue((prev) => ({
      ...prev,
      [name]: fileList[0] || null,
    }));
  };

  const handleSubmit = async () => {
    if (!formRef.current.check() || !formValue.file) {
      toast.error('لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', formValue.title);
      if (formValue.text) formData.append('text', formValue.text);
      if (formValue.categories) {
        //@ts-ignore
        formData.append('categories', formValue.categories);
      }
      if (formValue.file)
        //@ts-ignore
        formData.append('file', formValue.file.blobFile);
      if (formValue.poster)
        //@ts-ignore
        formData.append('poster', formValue.poster.blobFile);
      const res = await mutateAsync(formData);
      handleResponse(res, null, '', '');
    } catch (error) {
      handleResponse(null, error, '', 'مشکلی در آپلود ویدیو رخ داده است');
    }
  };

  // ---------------------- Rendering ----------------------
  return (
    <DashboardPanel title="آپلود فایل ویدیو و پوستر">
      <Form model={createVideoModel} formValue={formValue} ref={formRef} fluid>
        <div className="grid grid-cols-12 gap-4 mb-4">
          <TextField
            name="title"
            title="عنوان"
            containerClassName="col-span-6"
            value={formValue.title}
            onChange={(value: string) => handleInputChange('title', value)}
          />

          <TagField
            containerClassName="col-span-6"
            data={data?.data.categories.map((category: categoryType) => ({
              label: category.title,
              value: category.id,
            }))}
            name="categories"
            title="دسته‌بندی"
            value={formValue.categories}
            onChange={(value: categoryType[]) => handleInputChange('categories', value)}
            loading={isLoading}
          />

          <TexAreaField
            title="توضیحات (اختیاری)"
            name="text"
            containerClassName="col-span-6"
            value={formValue.text}
            onChange={(value: string) => handleInputChange('text', value)}
            rows={3}
            placeholder="توضیحات اختیاری درباره فایل"
          />

          <UploadField
            name="file"
            title="فایل ویدیو"
            containerClassName="col-span-12"
            //@ts-ignore
            handleImageChange={(files) => handleFileChange('file', files)}
            fileList={formValue.file ? [formValue.file] : []}
            accept="video/*"
          />

          <UploadField
            name="poster"
            title="فایل تصویری"
            containerClassName="col-span-12"
            //@ts-ignore
            handleImageChange={(files) => handleFileChange('poster', files)}
            fileList={formValue.poster ? [formValue.poster] : []}
            accept="image/*"
          />
        </div>
        <Button appearance="primary" onClick={handleSubmit} loading={isPending}>
          ذخیره
        </Button>
      </Form>
    </DashboardPanel>
  );
}

export default CreateVideoPage;
