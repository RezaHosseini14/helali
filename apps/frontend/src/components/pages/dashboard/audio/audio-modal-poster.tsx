'use client';

import Image from 'next/image';
import { useRef, type ChangeEvent } from 'react';

import toast from 'react-hot-toast';

import type { IUploadFileItem } from '@/components/global/fields/UploadField';
import { Button } from '@/components/ui/button';
import { getAcceptAttribute, validateClientFile } from '@/lib/upload';
import { cn } from '@/lib/utils';

interface IAudioModalPosterProps {
  readonly src?: string | null;
  readonly title?: string;
  readonly disabled?: boolean;
  readonly onChange: (files: IUploadFileItem[]) => void;
  readonly onRemove: () => void;
  readonly className?: string;
}

export function AudioModalPoster({
  src,
  title,
  disabled = false,
  onChange,
  onRemove,
  className,
}: IAudioModalPosterProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasPoster = Boolean(src);

  function emitFile(file: File | undefined): void {
    if (!file) {
      return;
    }

    const validationError = validateClientFile(file, 'image');

    if (validationError) {
      toast.error(validationError.message);
      return;
    }

    onChange([
      {
        blobFile: file,
        name: file.name,
        fileKey: `${file.name}-${Date.now()}`,
      },
    ]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    event.target.value = '';
    emitFile(file);
  }

  return (
    <div
      className={cn(
        'group relative size-full overflow-hidden rounded-2xl',
        'aspect-square',
        'bg-[linear-gradient(160deg,#164842_0%,#0f6e61_58%,#178a7a_100%)]',
        'shadow-[0_18px_40px_-24px_rgba(22,72,66,0.85)]',
        'ring-1 ring-white/10',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 20%, rgba(247,250,249,0.22), transparent 45%), radial-gradient(circle at 80% 85%, rgba(23,138,122,0.4), transparent 50%)',
        }}
        aria-hidden="true"
      />

      {hasPoster && src ? (
        <>
          <Image
            src={src}
            alt={title || 'پوستر صوت'}
            fill
            sizes="(max-width: 640px) 100vw, 220px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent"
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 z-1 flex items-end justify-between gap-2 p-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium tracking-[0.16em] text-white/60 uppercase">
                پوستر
              </p>
              {title ? (
                <p className="truncate text-xs font-semibold text-white/95">{title}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                className="h-8 rounded-full border border-white/15 bg-white/10 px-3 text-xs text-white hover:bg-white/20 hover:text-white"
              >
                تعویض
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                disabled={disabled}
                onClick={onRemove}
                aria-label="حذف پوستر"
                className="rounded-full border border-white/15 bg-white/10 text-white hover:bg-destructive/80 hover:text-white"
              >
                <i className="ki-outline ki-cross text-sm" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();

            if (disabled) {
              return;
            }

            emitFile(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            'relative z-1 flex size-full cursor-pointer flex-col items-center justify-center gap-3 px-4 text-center',
            'transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60',
          )}
        >
          <span className="grid size-14 place-content-center rounded-2xl border border-dashed border-white/35 bg-white/10 text-white shadow-inner backdrop-blur-sm">
            <i className="ki-outline ki-picture text-2xl" />
          </span>
          <span className="space-y-1">
            <span className="block text-sm font-semibold text-white">افزودن پوستر</span>
            <span className="block text-xs text-white/65">بکشید یا کلیک کنید</span>
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={getAcceptAttribute('image')}
        className="hidden"
        disabled={disabled}
        onChange={handleInputChange}
      />
    </div>
  );
}
