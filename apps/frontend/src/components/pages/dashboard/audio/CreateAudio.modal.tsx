'use client';

import { useMemo, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import TexAreaField from '@/components/global/fields/TexAreaField';
import TextField from '@/components/global/fields/TextField';
import UploadField, { type IUploadFileItem } from '@/components/global/fields/UploadField';
import RelatedMediaSelectField from '@/components/global/fields/RelatedMediaSelectField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { resolveCategoryList } from '@/lib/resolve-category-list';
import { buildUploadFormData, compressImageForUpload, validateClientFile } from '@/lib/upload';
import { cn } from '@/lib/utils';
import { getSchemaErrorMessage } from '@/lib/validate-schema';
import { createAudioModel } from 'models/createAudio.model';
import { uploadAudio } from 'services/audio/audioServices';
import { allCategory } from 'services/category/categoryServices';
import { handleResponse } from 'utils/functions';

export interface IAudioFormValue {
  title: string;
  text?: string;
  file?: IUploadFileItem | null;
  poster?: IUploadFileItem | null;
  categories?: number[];
  relatedVideoId?: number | null;
}

interface ICreateAudioModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly refetch: () => void;
}

const EMPTY_FORM: IAudioFormValue = {
  title: '',
  text: '',
  file: null,
  poster: null,
  categories: [],
  relatedVideoId: null,
};

export default function CreateAudioModal({ open, onClose, refetch }: ICreateAudioModalProps) {
  const [formValue, setFormValue] = useState<IAudioFormValue>(EMPTY_FORM);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['allCategory'],
    queryFn: () => allCategory(),
    enabled: open,
  });

  const categories = useMemo(() => resolveCategoryList(data?.data), [data]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ body }: { body: FormData }) => uploadAudio(body, setUploadProgress),
  });

  function handleInputChange(
    name: keyof IAudioFormValue,
    value: string | number[] | number | null,
  ): void {
    setFormValue((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(name: 'file' | 'poster', fileList: IUploadFileItem[]): void {
    setFormValue((prev) => ({ ...prev, [name]: fileList[0] || null }));
  }

  function toggleCategory(categoryId: number): void {
    const current = formValue.categories ?? [];
    const next = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId];
    handleInputChange('categories', next);
  }

  async function handleSubmit(): Promise<void> {
    const error = getSchemaErrorMessage(createAudioModel, formValue);
    const audioFile = formValue.file?.blobFile;
    const posterFile = formValue.poster?.blobFile;

    if (error || !audioFile || !posterFile) {
      toast.error(error || 'لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }

    const audioError = validateClientFile(audioFile, 'audio');
    const posterError = validateClientFile(posterFile, 'image');

    if (audioError || posterError) {
      toast.error(audioError?.message || posterError?.message || 'فایل نامعتبر است');
      return;
    }

    try {
      setUploadProgress(0);
      const compressedPoster = await compressImageForUpload(posterFile);
      const formData = buildUploadFormData({
        title: formValue.title,
        text: formValue.text,
        categories: formValue.categories,
        relatedVideoId: formValue.relatedVideoId,
        file: audioFile,
        poster: compressedPoster,
      });

      const res = await mutateAsync({ body: formData });

      if (res?.status === 201 || res?.status === 200) {
        setFormValue(EMPTY_FORM);
        refetch();
        onClose();
      }

      handleResponse(res, null, 'صوت با موفقیت آپلود شد', '');
    } catch (submitError) {
      handleResponse(null, submitError, '', 'مشکلی در آپلود صوت رخ داده است');
    } finally {
      setUploadProgress(null);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isPending) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>آپلود فایل صوتی</DialogTitle>
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
              containerClassName="col-span-12 sm:col-span-6"
              value={formValue.title}
              onChange={(value: string) => handleInputChange('title', value)}
            />

            <div className="col-span-12 flex flex-col gap-2 sm:col-span-6">
              <Label className="text-base font-semibold text-foreground">دسته‌بندی</Label>
              <div className="flex flex-wrap gap-2 rounded-xl border border-border/80 bg-background/60 p-2">
                {isLoading ? (
                  <span className="text-sm text-muted-foreground">در حال بارگذاری...</span>
                ) : categories.length === 0 ? (
                  <span className="text-sm text-muted-foreground">دسته‌بندی یافت نشد</span>
                ) : (
                  categories.map((category) => {
                    const isSelected = (formValue.categories ?? []).includes(category.id);
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => toggleCategory(category.id)}
                        className={cn(
                          'rounded-full px-3 py-1.5 text-sm transition',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground hover:bg-primary/15',
                        )}
                      >
                        {category.title}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <RelatedMediaSelectField
              kind="video"
              name="relatedVideoId"
              title="ویدیوی مرتبط (اختیاری)"
              containerClassName="col-span-12 sm:col-span-6"
              enabled={open}
              value={formValue.relatedVideoId}
              onChange={(value) => handleInputChange('relatedVideoId', value)}
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
              title="فایل صوتی (mp3)"
              mediaKind="audio"
              containerClassName="col-span-12"
              handleImageChange={(files) => handleFileChange('file', files)}
              fileList={formValue.file ? [formValue.file] : []}
              progressPercent={uploadProgress}
              disabled={isPending}
            />
            <UploadField
              name="poster"
              title="فایل پوستر"
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
