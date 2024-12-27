'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Tooltip, Uploader, Whisper } from 'rsuite';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Types and Models
import { categoryType } from 'types/category.type';
import { AudioFormValue } from '../../create/page';
import { createAudioModel } from 'models/createAudio.model';

// Services
import { audioById, updateAudioById } from 'services/audio/audioServices';
import { allCategory } from 'services/category/categoryServices';

// Components
import DashboardPanel from '@/components/global/DashboardPanel';
import TexAreaField from '@/components/global/fields/TexAreaField';
import TextField from '@/components/global/fields/TextField';
import UploadField from '@/components/global/fields/UploadField';
import TagField from '@/components/global/fields/TagField';
import Audio from '@/components/global/Audio';
import Image from 'next/image';
import LoaderProvider from '@/components/global/LoaderProvider';
import { handleResponse } from 'utils/functions';

type FormfileValueType = {
  file: string;
  poster: string;
};

function UpdateAudioPage({ params }: { params: { id: string } }) {
  // ---------------------- Data Fetching ----------------------
  const { data, isLoading } = useQuery({
    queryKey: ['allCategory'],
    queryFn: () => allCategory(),
  });
  const {
    data: dataAudioById,
    isLoading: isLoadingAudioById,
    refetch,
    isFetching: isFetchingAudioById,
  } = useQuery({
    queryKey: ['audioById', params.id],
    queryFn: () => audioById(Number(params.id)),
  });

  // ---------------------- State and Ref ----------------------
  const formRef = useRef<any>();
  const [formValue, setFormValue] = useState<AudioFormValue>({
    title: '',
    text: '',
    file: null,
    poster: null,
    categories: [],
  });

  const [formfileValue, setFormfileValue] = useState<FormfileValueType>({
    file: '',
    poster: '',
  });

  const [changedFields, setChangedFields] = useState<Partial<AudioFormValue & FormfileValueType>>({});

  const [posterImagePreview, setPosterImagePreview] = useState<null | string>(null);

  // ---------------------- useEffect ----------------------
  useEffect(() => {
    if (dataAudioById) {
      setFormValue({
        title: dataAudioById?.data?.audio?.title || '',
        text: dataAudioById?.data?.audio?.text || '',
        categories: dataAudioById?.data?.audio?.categories || [],
      });

      setFormfileValue({
        file: dataAudioById?.data?.audio?.path,
        poster: dataAudioById?.data?.audio?.posterPath,
      });
    }
  }, [dataAudioById]);

  // ---------------------- Event Handlers ----------------------
  const handleRemoveFormfileValue = (name: keyof FormfileValueType) => {
    setFormfileValue((prev) => ({
      ...prev,
      [name]: '',
    }));
    setChangedFields((prev) => ({ ...prev, [name]: '' }));
  };

  const handleInputChange = (name: keyof AudioFormValue, value: string) => {
    setFormValue((prev) => ({
      ...prev,
      [name]: value,
    }));
    setChangedFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name: keyof AudioFormValue, fileList: any[]) => {
    setFormValue((prev) => ({
      ...prev,
      [name]: fileList[0] || null,
    }));
    setChangedFields((prev) => ({ ...prev, [name]: fileList[0] || null }));
  };

  const previewFile = (
    file: Blob | undefined,
    callback: { (value: any): void; (arg0: string | ArrayBuffer | null): void },
  ) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  // ---------------------- Mutations ----------------------
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['updateAudioById'],
    mutationFn: ({ id, body }: { id: number; body: any }) => updateAudioById(body, id),
  });

  // ---------------------- Handle Submit ----------------------
  const handleSubmit = async () => {
    if (Object.keys(changedFields).length === 0) {
      toast.error('تغییری اعمال نشده است');
      return;
    }
    if (
      !formRef.current.check() ||
      (!formValue.file && !formfileValue.file) ||
      (!formValue.poster && !formfileValue.poster)
    ) {
      toast.error('لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }

    try {
      const formData = new FormData();

      for (const [key, value] of Object.entries(changedFields)) {
        if (value !== undefined) {
          if (key === 'categories' && Array.isArray(value)) {
            if (value.length === 1) {
              formData.append(key, `${value[0]}`);
            } else {
              value.forEach((category) => {
                formData.append(key, `${category}`);
              });
            }
          } else if (key === 'file') {
            formData.append('file', (formValue.file as unknown as { blobFile: Blob }).blobFile);
          } else if (key === 'poster') {
            formData.append('poster', (formValue.poster as unknown as { blobFile: Blob }).blobFile);
          } else {
            //@ts-ignore
            formData.append(key, value);
          }
        }
      }

      const res = await mutateAsync({
        body: formData,
        id: parseInt(params.id),
      });

      if (res?.status === 200) {
        refetch();
        setChangedFields({});
      }

      handleResponse(res, null, '', '');
    } catch (error) {
      handleResponse(null, error, '', 'مشکلی در به‌روزرسانی صوت رخ داده است');
    }
  };

  // ---------------------- Rendering ----------------------

  return (
    <DashboardPanel title="بروزرسانی فایل صوتی">
      <LoaderProvider loading={isFetchingAudioById || isLoadingAudioById}>
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

            <div className="col-span-2 row-span-2 rounded-lg overflow-hidden relative aspect-square">
              {formfileValue.poster ? (
                <>
                  <Whisper
                    placement="top"
                    controlId="control-id-hover"
                    trigger="hover"
                    speaker={<Tooltip>حذف فایل پوستر</Tooltip>}
                  >
                    <button className="remove-btn" onClick={() => handleRemoveFormfileValue('poster')}>
                      <i className="ki-outline ki-cross"></i>
                    </button>
                  </Whisper>
                  <Image
                    className="w-full"
                    src={formfileValue.poster}
                    alt={formValue.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </>
              ) : (
                <Uploader
                  title="فایل پوستر"
                  name="poster"
                  className="poster-uploader w-full"
                  fileListVisible={false}
                  fileList={formValue.poster ? [formValue.poster] : []}
                  onChange={(files) => handleFileChange('poster', files)}
                  listType="picture"
                  accept="image/*"
                  onUpload={(file) => {
                    previewFile(file.blobFile, (value) => {
                      setPosterImagePreview(value);
                    });
                  }}
                  action={''}
                >
                  <button>
                    {posterImagePreview ? (
                      <Image className="w-full" src={posterImagePreview} alt="image" layout="fill" objectFit="cover" />
                    ) : (
                      <i className="ki-solid ki-picture text-3xl"></i>
                    )}
                  </button>
                </Uploader>
                // <UploadField
                //   name="poster"
                //   title="فایل پوستر"
                //   containerClassName="col-span-12"
                //   handleImageChange={(files) => handleFileChange('poster', files)}
                //   fileList={formValue.poster ? [formValue.poster] : []}
                //   accept="image/*"
                // />
              )}
            </div>

            <div className="col-span-10 row-span-2 relative !h-[9rem]">
              {formfileValue.file ? (
                <>
                  <Whisper
                    placement="top"
                    controlId="control-id-hover"
                    trigger="hover"
                    speaker={<Tooltip>حذف فایل صوتی</Tooltip>}
                  >
                    <button className="remove-btn" onClick={() => handleRemoveFormfileValue('file')}>
                      <i className="ki-outline ki-cross"></i>
                    </button>
                  </Whisper>
                  <Audio
                    audioUrl={formfileValue.file}
                    audioDetails={dataAudioById?.data?.audio}
                    audioWidth={700}
                    audioHeight={60}
                    height="!h-full"
                  />
                </>
              ) : (
                <UploadField
                  name="file"
                  title="فایل صوتی"
                  handleImageChange={(files: any) => handleFileChange('file', files)}
                  fileList={formValue.file ? [formValue.file] : []}
                  accept="audio/*"
                />
              )}
            </div>
          </div>

          <Button
            disabled={!Object.keys(changedFields).length}
            appearance="primary"
            onClick={handleSubmit}
            loading={isPending}
          >
            بروزرسانی
          </Button>
        </Form>
      </LoaderProvider>
    </DashboardPanel>
  );
}

export default UpdateAudioPage;
