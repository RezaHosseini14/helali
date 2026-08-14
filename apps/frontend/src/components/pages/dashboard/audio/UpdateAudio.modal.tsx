'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import type { IAudioFormValue } from '@/components/pages/dashboard/audio/CreateAudio.modal';
import { AudioModalPlayer } from '@/components/pages/dashboard/audio/audio-modal-player';
import { AudioModalPoster } from '@/components/pages/dashboard/audio/audio-modal-poster';
import LoaderProvider from '@/components/global/LoaderProvider';
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
import {
  appendFormValue,
  compressImageForUpload,
  getAcceptAttribute,
  validateClientFile,
} from '@/lib/upload';
import { cn } from '@/lib/utils';
import { getSchemaErrorMessage } from '@/lib/validate-schema';
import { createAudioModel } from 'models/createAudio.model';
import { audioById, updateAudioById } from 'services/audio/audioServices';
import { allCategory } from 'services/category/categoryServices';
import { resolveCategoryList } from '@/lib/resolve-category-list';
import { categoryType } from 'types/category.type';
import { handleResponse } from 'utils/functions';

interface IFormFileValue {
  file: string;
  poster: string;
}

interface IUpdateAudioModalProps {
  readonly open: boolean;
  readonly id: number;
  readonly onClose: () => void;
  readonly refetch: () => void;
}

export default function UpdateAudioModal({ open, id, onClose, refetch }: IUpdateAudioModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['allCategory'],
    queryFn: () => allCategory(),
    enabled: open,
  });

  const {
    data: dataAudioById,
    isLoading: isLoadingAudioById,
    refetch: refetchAudio,
    isFetching: isFetchingAudioById,
  } = useQuery({
    queryKey: ['audioById', id],
    queryFn: () => audioById(id),
    enabled: open && id > 0,
  });

  const [formValue, setFormValue] = useState<IAudioFormValue>({
    title: '',
    text: '',
    file: null,
    poster: null,
    categories: [],
  });
  const [formfileValue, setFormfileValue] = useState<IFormFileValue>({ file: '', poster: '' });
  const [changedFields, setChangedFields] = useState<Partial<IAudioFormValue & IFormFileValue>>({});
  const [posterImagePreview, setPosterImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const audioReplaceInputRef = useRef<HTMLInputElement>(null);
  const audioPanelRef = useRef<HTMLDivElement>(null);
  const [posterSidePx, setPosterSidePx] = useState<number | null>(null);

  const audioPreviewSrc = useMemo(() => {
    const blobFile = formValue.file?.blobFile;

    if (blobFile) {
      return URL.createObjectURL(blobFile);
    }

    return formfileValue.file || '';
  }, [formValue.file, formfileValue.file]);

  useEffect(() => {
    return () => {
      if (audioPreviewSrc.startsWith('blob:')) {
        URL.revokeObjectURL(audioPreviewSrc);
      }
    };
  }, [audioPreviewSrc]);

  useEffect(() => {
    const panel = audioPanelRef.current;

    if (!panel) {
      return;
    }

    const syncPosterSize = (): void => {
      const nextSide = Math.round(panel.getBoundingClientRect().height);

      if (nextSide > 0) {
        setPosterSidePx(nextSide);
      }
    };

    syncPosterSize();

    const observer = new ResizeObserver(syncPosterSize);
    observer.observe(panel);

    return () => {
      observer.disconnect();
    };
  }, [audioPreviewSrc, open, isFetchingAudioById, isLoadingAudioById]);

  useEffect(() => {
    if (!dataAudioById) {
      return;
    }

    setFormValue({
      title: dataAudioById?.data?.audio?.title || '',
      text: dataAudioById?.data?.audio?.text || '',
      categories: dataAudioById?.data?.audio?.categories || [],
      relatedVideoId: dataAudioById?.data?.audio?.relatedVideo?.id ?? null,
    });
    setFormfileValue({
      file: dataAudioById?.data?.audio?.path,
      poster: dataAudioById?.data?.audio?.posterPath,
    });
    setChangedFields({});
    setPosterImagePreview(null);
  }, [dataAudioById]);

  function handleRemoveFormfileValue(name: keyof IFormFileValue): void {
    setFormfileValue((prev) => ({ ...prev, [name]: '' }));
    setChangedFields((prev) => ({ ...prev, [name]: '' }));
  }

  function handleInputChange(
    name: keyof IAudioFormValue,
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
    mutationKey: ['updateAudioById'],
    mutationFn: ({ audioId, body }: { audioId: number; body: FormData }) =>
      updateAudioById(body, audioId, setUploadProgress),
  });

  async function handleSubmit(): Promise<void> {
    if (Object.keys(changedFields).length === 0) {
      toast.error('تغییری اعمال نشده است');
      return;
    }

    const error = getSchemaErrorMessage(createAudioModel, formValue);
    if (
      error ||
      (!formValue.file && !formfileValue.file) ||
      (!formValue.poster && !formfileValue.poster)
    ) {
      toast.error(error || 'لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }

    const audioBlob = formValue.file?.blobFile;
    const posterBlob = formValue.poster?.blobFile;

    if (audioBlob) {
      const audioError = validateClientFile(audioBlob, 'audio');
      if (audioError) {
        toast.error(audioError.message);
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

        if (key === 'relatedVideoId') {
          formData.append(key, value === null ? '' : String(value));
          continue;
        }

        if (key === 'file' && audioBlob) {
          formData.append('file', audioBlob);
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

      const res = await mutateAsync({ body: formData, audioId: id });

      if (res?.status === 200) {
        setChangedFields({});
        void refetchAudio();
        refetch();
        onClose();
      }

      handleResponse(res, null, '', '');
    } catch (submitError) {
      handleResponse(null, submitError, '', 'مشکلی در به‌روزرسانی صوت رخ داده است');
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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>بروزرسانی فایل صوتی</DialogTitle>
        </DialogHeader>
        <LoaderProvider loading={isFetchingAudioById || isLoadingAudioById}>
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
                kind="video"
                name="relatedVideoId"
                title="ویدیوی مرتبط (اختیاری)"
                containerClassName="col-span-12 sm:col-span-6"
                enabled={open}
                value={formValue.relatedVideoId}
                selectedMedia={dataAudioById?.data?.audio?.relatedVideo ?? null}
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

              <div className="col-span-12 flex flex-col gap-4 rounded-2xl border border-border/70 bg-muted/25 p-3 sm:flex-row sm:items-start sm:p-4">
                <div
                  className="mx-auto w-full max-w-full shrink-0 sm:mx-0"
                  style={
                    posterSidePx
                      ? { width: posterSidePx, height: posterSidePx }
                      : undefined
                  }
                >
                  <AudioModalPoster
                    className="size-full"
                    src={posterImagePreview || formfileValue.poster || null}
                    title={formValue.title || dataAudioById?.data?.audio?.title}
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

                <div ref={audioPanelRef} className="flex min-w-0 flex-1 flex-col">
                  {audioPreviewSrc ? (
                    <>
                      <AudioModalPlayer
                        className="min-h-46 w-full"
                        src={audioPreviewSrc}
                        title={formValue.title || dataAudioById?.data?.audio?.title}
                        disabled={isPending}
                        onReplace={() => audioReplaceInputRef.current?.click()}
                        onRemove={() => {
                          handleRemoveFormfileValue('file');
                          setFormValue((prev) => ({ ...prev, file: null }));
                        }}
                      />
                      <input
                        ref={audioReplaceInputRef}
                        type="file"
                        accept={getAcceptAttribute('audio')}
                        className="hidden"
                        disabled={isPending}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = '';

                          if (!file) {
                            return;
                          }

                          const validationError = validateClientFile(file, 'audio');

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
                    </>
                  ) : (
                    <div
                      className={cn(
                        'relative flex min-h-46 w-full flex-col justify-center overflow-hidden rounded-2xl',
                        'border border-dashed border-primary/30 bg-[linear-gradient(160deg,rgba(15,110,97,0.08),rgba(23,138,122,0.04)_55%,transparent)]',
                      )}
                    >
                      <div
                        className="pointer-events-none absolute inset-x-6 bottom-5 flex h-10 items-end justify-between gap-1 opacity-35"
                        aria-hidden="true"
                      >
                        {Array.from({ length: 28 }).map((_, index) => (
                          <span
                            key={index}
                            className="w-1 rounded-full bg-primary/70"
                            style={{ height: `${18 + ((index * 17) % 55)}%` }}
                          />
                        ))}
                      </div>
                      <UploadField
                        name="file"
                        title="انتخاب فایل صوتی"
                        mediaKind="audio"
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
