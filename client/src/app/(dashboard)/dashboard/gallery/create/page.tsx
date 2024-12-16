'use client';
import { useRef, useState } from 'react';
import { Button, Form } from 'rsuite';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
//model
import { createGalleryModel } from 'models/createGallery.model';
//services
import { ImageAudio } from 'services/gallery/galleryServices';
//components
import DashboardPanel from '@/components/global/DashboardPanel';
import TexAreaField from '@/components/global/fields/TexAreaField';
import UploadField from '@/components/global/fields/UploadField';

type GalleryFormValue = {
  desc: string;
  file?: File | null;
};

function CreateGalleryPage() {
  const formRef = useRef<any>();
  const [formValue, setFormValue] = useState<GalleryFormValue>({
    desc: '',
    file: null,
  });

  const handleInputChange = (name: keyof GalleryFormValue, value: string) => {
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (name: keyof GalleryFormValue, fileList: any[]) => {
    setFormValue((prev) => ({
      ...prev,
      [name]: fileList[0] || null,
    }));
  };

  const { mutateAsync } = useMutation({
    mutationFn: ImageAudio,
  });

  const handleSubmit = async () => {
    if (!formRef.current.check() || !formValue.file) {
      toast.error('لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('desc', formValue.desc);
      if (formValue.file)
        //@ts-ignoreس
        formData.append('file', formValue.file.blobFile);

      const res = await mutateAsync(formData);
      if (res?.status == 201) {
        toast.success('تصویر ذخیره شد');
      } else {
        toast.error('تصویر ذخیره نشد');
      }
    } catch (error) {
      toast.error('تصویر ذخیره نشد');
    }
  };

  return (
    <DashboardPanel title="آپلود فایل تصویری">
      <Form model={createGalleryModel} ref={formRef} formValue={formValue}>
        <div className="grid grid-cols-12 gap-4 mb-4">
          <TexAreaField
            title="توضیحات"
            name="desc"
            containerClassName="!col-span-12"
            value={formValue.desc}
            onChange={(value: string) => handleInputChange('desc', value)}
            rows={3}
            placeholder="توضیحات درباره فایل"
          />
          <UploadField
            name="file"
            title="فایل تصویری"
            containerClassName="col-span-12"
            //@ts-ignore
            handleImageChange={(files) => handleFileChange('file', files)}
            fileList={formValue.file ? [{ blobFile: formValue.file }] : []}
            accept=""
          />
        </div>
        <Button appearance="primary" onClick={handleSubmit}>
          ذخیره
        </Button>
      </Form>
    </DashboardPanel>
  );
}

export default CreateGalleryPage;
