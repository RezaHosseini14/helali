'use client';

import { useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import TexAreaField from '@/components/global/fields/TexAreaField';
import UploadField, { type IUploadFileItem } from '@/components/global/fields/UploadField';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { galleryKeys } from '@/features/gallery/hooks/gallery-keys';
import { buildUploadFormData, compressImageForUpload, validateClientFile } from '@/lib/upload';
import { getSchemaErrorMessage } from '@/lib/validate-schema';
import { createGalleryModel } from 'models/createGallery.model';
import { ImageAudio } from 'services/gallery/galleryServices';
import { handleResponse } from 'utils/functions';

interface IGalleryFormValue {
  desc: string;
  isFeatured: boolean;
  file?: IUploadFileItem | null;
}

interface ICreateGalleryModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly refetch: () => void;
}

const EMPTY_FORM: IGalleryFormValue = {
  desc: '',
  isFeatured: false,
  file: null,
};

export default function CreateGalleryModal({ open, onClose, refetch }: ICreateGalleryModalProps) {
  const queryClient = useQueryClient();
  const [formValue, setFormValue] = useState<IGalleryFormValue>(EMPTY_FORM);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: ({ body }: { body: FormData }) => ImageAudio(body, setUploadProgress),
  });

  function handleInputChange(name: keyof IGalleryFormValue, value: string): void {
    setFormValue((prev) => ({ ...prev, [name]: value }));
  }

  function handleFileChange(fileList: IUploadFileItem[]): void {
    setFormValue((prev) => ({ ...prev, file: fileList[0] || null }));
  }

  async function handleSubmit(): Promise<void> {
    const error = getSchemaErrorMessage(createGalleryModel, formValue);
    const imageFile = formValue.file?.blobFile;
    const isFeatured = formValue.isFeatured;

    if (error || !imageFile) {
      toast.error(error || 'لطفاً تمام فیلدهای ضروری را پر کنید');
      return;
    }

    const imageError = validateClientFile(imageFile, 'image');

    if (imageError) {
      toast.error(imageError.message);
      return;
    }

    try {
      setUploadProgress(0);
      const compressed = await compressImageForUpload(imageFile);
      const formData = buildUploadFormData({
        desc: formValue.desc,
        isFeatured: isFeatured ? 'true' : 'false',
        file: compressed,
      });

      const res = await mutateAsync({ body: formData });

      if (res?.status === 201 || res?.status === 200) {
        setFormValue(EMPTY_FORM);
        refetch();
        void queryClient.invalidateQueries({ queryKey: ['allImage'] });
        void queryClient.invalidateQueries({ queryKey: galleryKeys.featured() });
        onClose();
      }

      handleResponse(res, null, '', '');
    } catch (submitError) {
      handleResponse(null, submitError, '', 'مشکلی در آپلود تصویر رخ داده است');
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>آپلود فایل تصویری</DialogTitle>
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
              mediaKind="image"
              containerClassName="col-span-12"
              handleImageChange={handleFileChange}
              fileList={formValue.file ? [formValue.file] : []}
              progressPercent={uploadProgress}
              disabled={isPending}
            />
            <div className="col-span-12 flex items-center gap-2">
              <Checkbox
                id="create-gallery-featured"
                checked={formValue.isFeatured}
                onCheckedChange={(checked) =>
                  setFormValue((prev) => ({ ...prev, isFeatured: checked === true }))
                }
              />
              <Label htmlFor="create-gallery-featured" className="cursor-pointer">
                نمایش در اسلایدر منتخب صفحه اول
              </Label>
            </div>
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
