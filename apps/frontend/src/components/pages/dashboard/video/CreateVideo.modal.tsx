'use client';

import { useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import TexAreaField from '@/components/global/fields/TexAreaField';
import TextField from '@/components/global/fields/TextField';
import UploadField, { type IUploadFileItem } from '@/components/global/fields/UploadField';
import RelatedMediaSelectField from '@/components/global/fields/RelatedMediaSelectField';
import TagField from '@/components/global/fields/TagField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { buildUploadFormData, compressImageForUpload, validateClientFile } from '@/lib/upload';
import { getSchemaErrorMessage } from '@/lib/validate-schema';
import { createVideoModel } from 'models/createVideo.model';
import { allCategory } from 'services/category/categoryServices';
import { uploadVideo } from 'services/video/videoServices';
import { resolveCategoryList } from '@/lib/resolve-category-list';
import { handleResponse } from 'utils/functions';

export interface IVideoFormValue {
  title: string;
  text?: string;
  file?: IUploadFileItem | null;
  poster?: IUploadFileItem | null;
  categories?: number[];
  relatedAudioId?: number | null;
}

interface ICreateVideoModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly refetch: () => void;
}

const EMPTY_FORM: IVideoFormValue = {
  title: '',
  text: '',
  file: null,
  poster: null,
  categories: [],
  relatedAudioId: null,
};

export default function CreateVideoModal({ open, onClose, refetch }: ICreateVideoModalProps) {
  const [formValue, setFormValue] = useState<IVideoFormValue>(EMPTY_FORM);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['allCategory'],
    queryFn: () => allCategory(),
    enabled: open,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ body }: { body: FormData }) => uploadVideo(body, setUploadProgress),
  });

  function handleInputChange(
    name: keyof IVideoFormValue,
    value: string | number[] | number | null,
  ): void {
    setFormValue((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(name: 'file' | 'poster', fileList: IUploadFileItem[]): void {
    setFormValue((prev) => ({ ...prev, [name]: fileList[0] || null }));
  }

  async function handleSubmit(): Promise<void> {
    const error = getSchemaErrorMessage(createVideoModel, formValue);
    const videoFile = formValue.file?.blobFile;
    const posterFile = formValue.poster?.blobFile;

    if (error || !videoFile || !posterFile) {
      toast.error(error || 'لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }

    const videoError = validateClientFile(videoFile, 'video');
    const posterError = validateClientFile(posterFile, 'image');

    if (videoError || posterError) {
      toast.error(videoError?.message || posterError?.message || 'فایل نامعتبر است');
      return;
    }

    try {
      setUploadProgress(0);
      const compressedPoster = await compressImageForUpload(posterFile);
      const formData = buildUploadFormData({
        title: formValue.title,
        text: formValue.text,
        categories: formValue.categories,
        relatedAudioId: formValue.relatedAudioId,
        file: videoFile,
        poster: compressedPoster,
      });

      const res = await mutateAsync({ body: formData });

      if (res?.status === 201 || res?.status === 200) {
        setFormValue(EMPTY_FORM);
        refetch();
        onClose();
      }

      handleResponse(res, null, '', '');
    } catch (submitError) {
      handleResponse(null, submitError, '', 'مشکلی در آپلود ویدیو رخ داده است');
    } finally {
      setUploadProgress(null);
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
          <DialogTitle>آپلود فایل ویدیو و پوستر</DialogTitle>
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
              name="title"
              title="عنوان"
              containerClassName="col-span-6"
              value={formValue.title}
              onChange={(value: string) => handleInputChange('title', value)}
            />
            <TagField
              containerClassName="col-span-6"
              data={resolveCategoryList(data?.data).map((category) => ({
                label: category.title,
                value: category.id,
              }))}
              name="categories"
              title="دسته‌بندی"
              value={formValue.categories ?? []}
              onChange={(value) => handleInputChange('categories', value)}
              loading={isLoading}
            />
            <RelatedMediaSelectField
              kind="audio"
              name="relatedAudioId"
              title="صوت مرتبط (اختیاری)"
              containerClassName="col-span-12 sm:col-span-6"
              enabled={open}
              value={formValue.relatedAudioId}
              onChange={(value) => handleInputChange('relatedAudioId', value)}
              disabled={isPending}
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
              title="فایل ویدیو"
              mediaKind="video"
              containerClassName="col-span-12"
              handleImageChange={(files) => handleFileChange('file', files)}
              fileList={formValue.file ? [formValue.file] : []}
              progressPercent={uploadProgress}
              disabled={isPending}
            />
            <UploadField
              name="poster"
              title="فایل تصویری"
              mediaKind="image"
              containerClassName="col-span-12"
              handleImageChange={(files) => handleFileChange('poster', files)}
              fileList={formValue.poster ? [formValue.poster] : []}
              disabled={isPending}
            />
          </div>
          </DialogBody>
          <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
            <Button type="submit" isLoading={isPending}>
              ذخیره
            </Button>
            <Button type="button" variant="subtle" onClick={onClose} disabled={isPending}>
              انصراف
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
