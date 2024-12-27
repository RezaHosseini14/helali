'use client';
import { useRef, useState } from 'react';
import { Button, Form } from 'rsuite';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

//Functions
import { handleResponse } from 'utils/functions';

//Model
import { createGalleryModel } from 'models/createGallery.model';

//Services
import { ImageAudio } from 'services/gallery/galleryServices';

//Components
import DashboardPanel from '@/components/global/DashboardPanel';
import TexAreaField from '@/components/global/fields/TexAreaField';
import UploadField from '@/components/global/fields/UploadField';

type GalleryFormValue = {
  desc: string;
  file?: File | null;
};

function CreateGalleryPage() {
  // ---------------------- State and Ref ----------------------
  const formRef = useRef<any>();
  const [formValue, setFormValue] = useState<GalleryFormValue>({
    desc: '',
    file: null,
  });

  // ---------------------- Mutations ----------------------
  const { mutateAsync, isPending } = useMutation({
    mutationFn: ImageAudio,
  });

  // ---------------------- Event Handlers ----------------------
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

  const handleSubmit = async () => {
    if (!formRef.current.check() || !formValue.file) {
      toast.error('لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('desc', formValue.desc);
      if (formValue.file)
        //@ts-ignore
        formData.append('file', formValue.file.blobFile);
      const res = await mutateAsync(formData);
      handleResponse(res, null, '', '');
    } catch (error: any) {
      handleResponse(null, error, '', 'مشکلی در آپلود تصویر رخ داده است');
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
        <Button appearance="primary" onClick={handleSubmit} loading={isPending}>
          ذخیره
        </Button>
      </Form>
    </DashboardPanel>
  );
}

export default CreateGalleryPage;
