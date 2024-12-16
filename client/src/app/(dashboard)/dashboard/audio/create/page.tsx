'use client';
import React, { useRef, useState } from 'react';
import { Button, Form } from 'rsuite';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
//types
import { categoryType } from 'types/category.type';
//model
import { createAudioModel } from 'models/createAudio.model';
//services
import { uploadAudio } from 'services/audio/audioServices';
import { allCategory } from 'services/category/categoryServices';
//components
import DashboardPanel from '@/components/global/DashboardPanel';
import TexAreaField from '@/components/global/fields/TexAreaField';
import TextField from '@/components/global/fields/TextField';
import UploadField from '@/components/global/fields/UploadField';
import TagField from '@/components/global/fields/TagField';

export type AudioFormValue = {
  title: string;
  text?: string;
  file?: File | null;
  poster?: File | null;
  categories?: categoryType[];
};

function CreateAudioPage() {
  const { data, isLoading } = useQuery({ queryKey: ['allCategory'], queryFn: allCategory });

  const formRef = useRef<any>();
  const [formValue, setFormValue] = useState<AudioFormValue>({
    title: '',
    text: '',
    file: null,
    poster: null,
    categories: [],
  });

  const handleInputChange = (name: keyof AudioFormValue, value: string) => {
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (name: keyof AudioFormValue, fileList: any[]) => {
    setFormValue((prev) => ({
      ...prev,
      [name]: fileList[0] || null,
    }));
  };

  const { mutateAsync } = useMutation({
    mutationFn: uploadAudio,
  });

  const handleSubmit = async () => {
    if (!formRef.current.check() || !formValue.file) {
      toast.error('لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', formValue.title);
      if (formValue.text) formData.append('text', formValue.text);
      //@ts-ignore
      if (formValue.categories) formData.append('categories', formValue.categories);
      if (formValue.file)
        //@ts-ignore
        formData.append('file', formValue.file.blobFile);
      if (formValue.poster)
        //@ts-ignore
        formData.append('poster', formValue.poster.blobFile);
      const res = await mutateAsync(formData);
      if (res?.status == 201) {
        toast.success('صوت ذخیره شد');
      } else {
        toast.error('صوت ذخیره نشد');
      }
    } catch (error) {
      toast.error('صوت ذخیره نشد');
    }
  };

  return (
    <DashboardPanel title="آپلود فایل صوتی">
      <Form model={createAudioModel} formValue={formValue} ref={formRef} fluid>
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
            onChange={(value: any) => handleInputChange('categories', value)}
            loading={isLoading}
          />

          <TexAreaField
            title="توضیحات (اختیاری)"
            name="text"
            containerClassName="col-span-12"
            value={formValue.text}
            onChange={(value: string) => handleInputChange('text', value)}
            rows={3}
            placeholder="توضیحات اختیاری درباره فایل"
          />

          <UploadField
            name="file"
            title="فایل صوتی"
            containerClassName="col-span-12"
            //@ts-ignore
            handleImageChange={(files) => handleFileChange('file', files)}
            fileList={formValue.file ? [formValue.file] : []}
            accept="audio/*"
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
        <Button appearance="primary" onClick={handleSubmit}>
          ذخیره
        </Button>
      </Form>
    </DashboardPanel>
  );
}

export default CreateAudioPage;
