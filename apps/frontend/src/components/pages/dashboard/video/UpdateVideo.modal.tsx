'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import LoaderProvider from '@/components/global/LoaderProvider';
import TexAreaField from '@/components/global/fields/TexAreaField';
import TextField from '@/components/global/fields/TextField';
import UploadField, { type IUploadFileItem } from '@/components/global/fields/UploadField';
import RelatedMediaSelectField from '@/components/global/fields/RelatedMediaSelectField';
import TagField from '@/components/global/fields/TagField';
import { AudioModalPoster } from '@/components/pages/dashboard/audio/audio-modal-poster';
import type { IVideoFormValue } from '@/components/pages/dashboard/video/CreateVideo.modal';
import { VideoModalPlayer } from '@/components/pages/dashboard/video/video-modal-player';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { resolveCategoryList } from '@/lib/resolve-category-list';
import {
  appendFormValue,
  compressImageForUpload,
  getAcceptAttribute,
  validateClientFile,
} from '@/lib/upload';
import { cn } from '@/lib/utils';
import { getSchemaErrorMessage } from '@/lib/validate-schema';
import { createVideoModel } from 'models/createVideo.model';
import { allCategory } from 'services/category/categoryServices';
import { updateVideoById, videoById } from 'services/video/videoServices';
import { handleResponse } from 'utils/functions';

interface IFormFileValue {
  file: string;
  poster: string;
}

interface IUpdateVideoModalProps {
  readonly open: boolean;
  readonly id: number;
  readonly onClose: () => void;
  readonly refetch: () => void;
}

export default function UpdateVideoModal({ open, id, onClose, refetch }: IUpdateVideoModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['allCategory'],
    queryFn: () => allCategory(),
    enabled: open,
  });

  const {
    data: dataVideoById,
    isLoading: isLoadingVideoById,
    refetch: refetchVideo,
    isFetching: isFetchingVideoById,
  } = useQuery({
    queryKey: ['videoById', id],
    queryFn: () => videoById(id),
    enabled: open && id > 0,
  });

  const [formValue, setFormValue] = useState<IVideoFormValue>({
    title: '',
    text: '',
    file: null,
    poster: null,
    categories: [],
  });
  const [formfileValue, setFormfileValue] = useState<IFormFileValue>({ file: '', poster: '' });
  const [changedFields, setChangedFields] = useState<Partial<IVideoFormValue & IFormFileValue>>({});
  const [posterImagePreview, setPosterImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const videoReplaceInputRef = useRef<HTMLInputElement>(null);

  const videoPreviewSrc = useMemo(() => {
    const blobFile = formValue.file?.blobFile;

    if (blobFile) {
      return URL.createObjectURL(blobFile);
    }

    return formfileValue.file || '';
  }, [formValue.file, formfileValue.file]);

  useEffect(() => {
    return () => {
      if (videoPreviewSrc.startsWith('blob:')) {
        URL.revokeObjectURL(videoPreviewSrc);
      }
    };
  }, [videoPreviewSrc]);

  useEffect(() => {
    if (!dataVideoById) {
      return;
    }

    setFormValue({
      title: dataVideoById?.data?.video?.title || '',
      text: dataVideoById?.data?.video?.text || '',
      categories: dataVideoById?.data?.video?.categories || [],
      relatedAudioId: dataVideoById?.data?.video?.relatedAudio?.id ?? null,
    });
    setFormfileValue({
      file: dataVideoById?.data?.video?.path,
      poster: dataVideoById?.data?.video?.posterPath,
    });
    setChangedFields({});
    setPosterImagePreview(null);
  }, [dataVideoById]);

  function handleRemoveFormfileValue(name: keyof IFormFileValue): void {
    setFormfileValue((prev) => ({ ...prev, [name]: '' }));
    setChangedFields((prev) => ({ ...prev, [name]: '' }));
  }

  function handleInputChange(
    name: keyof IVideoFormValue,
    value: string | number[] | number | null,
  ): void {
    setFormValue((prev) => ({ ...prev, [name]: value }));
    setChangedFields((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(name: 'file' | 'poster', fileList: IUploadFileItem[]): void {
    const nextFile = fileList[0] || null;
    setFormValue((prev) => ({ ...prev, [name]: nextFile }));
    setChangedFields((prev) => ({ ...prev, [name]: nextFile }));

    if (name === 'poster' && nextFile?.blobFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterImagePreview(typeof reader.result === 'string' ? reader.result : null);
      };
      reader.readAsDataURL(nextFile.blobFile);
    }
  }

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['updateVideoById'],
    mutationFn: ({ videoId, body }: { videoId: number; body: FormData }) =>
      updateVideoById(body, videoId, setUploadProgress),
  });

  async function handleSubmit(): Promise<void> {
    if (Object.keys(changedFields).length === 0) {
      toast.error('تغییری اعمال نشده است');
      return;
    }

    const error = getSchemaErrorMessage(createVideoModel, formValue);
    if (
      error ||
      (!formValue.file && !formfileValue.file) ||
      (!formValue.poster && !formfileValue.poster)
    ) {
      toast.error(error || 'لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }

    const videoBlob = formValue.file?.blobFile;
    const posterBlob = formValue.poster?.blobFile;

    if (videoBlob) {
      const videoError = validateClientFile(videoBlob, 'video');
      if (videoError) {
        toast.error(videoError.message);
        return;
      }
    }

    if (posterBlob) {
      const posterError = validateClientFile(posterBlob, 'image');
      if (posterError) {
        toast.error(posterError.message);
        return;
      }
    }

    try {
      setUploadProgress(0);
      const formData = new FormData();

      for (const [key, value] of Object.entries(changedFields)) {
        if (value === undefined) {
          continue;
        }

        if (key === 'categories' && Array.isArray(value)) {
          appendFormValue(formData, key, value as number[]);
          continue;
        }

        if (key === 'relatedAudioId') {
          formData.append(key, value === null ? '' : String(value));
          continue;
        }

        if (key === 'file' && videoBlob) {
          formData.append('file', videoBlob);
          continue;
        }

        if (key === 'poster' && posterBlob) {
          const compressedPoster = await compressImageForUpload(posterBlob);
          formData.append('poster', compressedPoster);
          continue;
        }

        if (typeof value === 'string' || typeof value === 'number') {
          appendFormValue(formData, key, value);
        }
      }

      const res = await mutateAsync({ body: formData, videoId: id });

      if (res?.status === 200) {
        setChangedFields({});
        void refetchVideo();
        refetch();
        onClose();
      }

      handleResponse(res, null, '', '');
    } catch (submitError) {
      handleResponse(null, submitError, '', 'مشکلی در به‌روزرسانی ویدیو رخ داده است');
    } finally {
      setUploadProgress(null);
    }
  }

  const posterPreview = posterImagePreview || formfileValue.poster || null;

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>بروزرسانی فایل ویدیو</DialogTitle>
        </DialogHeader>
        <LoaderProvider loading={isFetchingVideoById || isLoadingVideoById}>
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
                selectedMedia={dataVideoById?.data?.video?.relatedAudio ?? null}
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

              <div className="col-span-12 flex flex-col gap-4 rounded-2xl border border-border/70 bg-muted/25 p-3 sm:flex-row sm:items-start sm:p-4">
                <div className="mx-auto w-full max-w-40 shrink-0 sm:mx-0 sm:max-w-44">
                  <AudioModalPoster
                    className="size-full"
                    src={posterPreview}
                    title={formValue.title || dataVideoById?.data?.video?.title}
                    disabled={isPending}
                    onChange={(files) => {
                      handleFileChange('poster', files);
                      setFormfileValue((prev) => ({ ...prev, poster: '' }));
                    }}
                    onRemove={() => {
                      handleRemoveFormfileValue('poster');
                      setPosterImagePreview(null);
                      setFormValue((prev) => ({ ...prev, poster: null }));
                    }}
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <input
                    ref={videoReplaceInputRef}
                    type="file"
                    accept={getAcceptAttribute('video')}
                    className="sr-only"
                    tabIndex={-1}
                    disabled={isPending}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = '';

                      if (!file) {
                        return;
                      }

                      const validationError = validateClientFile(file, 'video');

                      if (validationError) {
                        toast.error(validationError.message);
                        return;
                      }

                      handleFileChange('file', [
                        {
                          blobFile: file,
                          name: file.name,
                          fileKey: `${file.name}-${Date.now()}`,
                        },
                      ]);
                      setFormfileValue((prev) => ({ ...prev, file: '' }));
                    }}
                  />
                  {videoPreviewSrc ? (
                    <VideoModalPlayer
                      className="w-full"
                      src={videoPreviewSrc}
                      poster={posterPreview}
                      mimeType={
                        formValue.file?.blobFile?.type || dataVideoById?.data?.video?.mimetype
                      }
                      title={formValue.title || dataVideoById?.data?.video?.title}
                      disabled={isPending}
                      onReplace={() => {
                        videoReplaceInputRef.current?.click();
                      }}
                      onRemove={() => {
                        handleRemoveFormfileValue('file');
                        setFormValue((prev) => ({ ...prev, file: null }));
                      }}
                    />
                  ) : (
                    <div
                      className={cn(
                        'relative flex min-h-46 w-full flex-col justify-center overflow-hidden rounded-2xl',
                        'border border-dashed border-primary/30 bg-[linear-gradient(160deg,rgba(15,110,97,0.08),rgba(23,138,122,0.04)_55%,transparent)]',
                      )}
                    >
                      <UploadField
                        name="file"
                        title="انتخاب فایل ویدیو"
                        mediaKind="video"
                        containerClassName="relative z-1 [&_.poster-uploader]:border-0 [&_.poster-uploader]:bg-transparent [&_.poster-uploader]:py-8"
                        handleImageChange={(files) => handleFileChange('file', files)}
                        fileList={formValue.file ? [formValue.file] : []}
                        progressPercent={uploadProgress}
                        disabled={isPending}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            </DialogBody>

            {typeof uploadProgress === 'number' ? (
              <div className="mx-4 mb-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            ) : null}

            <DialogFooter className="flex flex-row items-center justify-between sm:justify-between">
              <Button
                type="submit"
                disabled={!Object.keys(changedFields).length}
                isLoading={isPending}
              >
                بروزرسانی
              </Button>
              <Button type="button" variant="subtle" onClick={onClose} disabled={isPending}>
                انصراف
              </Button>
            </DialogFooter>
          </form>
        </LoaderProvider>
      </DialogContent>
    </Dialog>
  );
}
