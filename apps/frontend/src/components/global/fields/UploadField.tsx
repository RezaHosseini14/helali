'use client';

import { useEffect, useMemo, useRef, type ChangeEvent, type DragEvent } from 'react';

import type { HelaliMediaKind } from '@helali/shared';
import toast from 'react-hot-toast';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatBytes, getAcceptAttribute, validateClientFile } from '@/lib/upload';

export interface IUploadFileItem {
  blobFile?: File;
  name?: string;
  fileKey?: string | number;
  url?: string;
}

interface IUploadFieldProps {
  readonly title?: string;
  readonly name: string;
  readonly handleImageChange: (files: IUploadFileItem[]) => void;
  readonly accept?: string;
  readonly mediaKind?: HelaliMediaKind;
  readonly containerClassName?: string;
  readonly fileList: IUploadFileItem[];
  readonly lable?: boolean;
  readonly multiple?: boolean;
  readonly progressPercent?: number | null;
  readonly disabled?: boolean;
}

function UploadField(props: IUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMultiple = props.multiple === true;
  const accept = props.accept ?? (props.mediaKind ? getAcceptAttribute(props.mediaKind) : undefined);

  const previewUrl = useMemo(() => {
    const first = props.fileList?.[0];

    if (!first) {
      return null;
    }

    if (first.url) {
      return first.url;
    }

    if (first.blobFile?.type.startsWith('image/')) {
      return URL.createObjectURL(first.blobFile);
    }

    return null;
  }, [props.fileList]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const emitFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const files = Array.from(fileList);
    const accepted: IUploadFileItem[] = [];

    for (const [index, file] of files.entries()) {
      if (props.mediaKind) {
        const validationError = validateClientFile(file, props.mediaKind);

        if (validationError) {
          toast.error(validationError.message);
          continue;
        }
      }

      accepted.push({
        blobFile: file,
        name: file.name,
        fileKey: `${file.name}-${Date.now()}-${index}`,
      });
    }

    if (accepted.length === 0) {
      return;
    }

    const nextList = isMultiple ? [...(props.fileList ?? []), ...accepted] : accepted;
    props.handleImageChange(nextList);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    emitFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (props.disabled) {
      return;
    }

    emitFiles(event.dataTransfer.files);
  };

  const handleClear = () => {
    props.handleImageChange([]);
  };

  const selectedFile = props.fileList?.[0]?.blobFile;
  const showProgress =
    typeof props.progressPercent === 'number' &&
    props.progressPercent >= 0 &&
    props.progressPercent <= 100;

  return (
    <div className={cn('flex flex-col gap-1.5', props.containerClassName)}>
      {props.lable ? (
        <Label className="text-base font-semibold text-foreground">{props.title}</Label>
      ) : null}

      <div
        role="button"
        tabIndex={props.disabled ? -1 : 0}
        className={cn(
          'poster-uploader relative grid place-content-center w-full cursor-pointer rounded-xl border border-dashed border-border bg-muted/40 px-4 py-10 transition-colors',
          props.disabled && 'pointer-events-none opacity-60',
        )}
        onClick={() => {
          if (!props.disabled) {
            inputRef.current?.click();
          }
        }}
        onKeyDown={(event) => {
          if (props.disabled) {
            return;
          }

          if (event.key === 'Enter' || event.key === ' ') {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt={props.title ?? 'preview'}
            className="mx-auto mb-3 max-h-36 rounded-md object-cover"
          />
        ) : null}

        <span className="text-center text-xl font-bold text-foreground">{props.title}</span>

        {selectedFile ? (
          <span
            className="mt-2 block w-full min-w-0 truncate px-1 text-center text-sm text-muted-foreground"
            title={`${selectedFile.name} · ${formatBytes(selectedFile.size)}`}
          >
            {selectedFile.name} · {formatBytes(selectedFile.size)}
          </span>
        ) : (
          <span className="mt-2 text-center text-sm text-muted-foreground">
            فایل را بکشید یا کلیک کنید
          </span>
        )}

        <input
          ref={inputRef}
          type="file"
          name={props.name}
          accept={accept}
          multiple={isMultiple}
          disabled={props.disabled}
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {showProgress ? (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-200"
            style={{ width: `${props.progressPercent}%` }}
          />
        </div>
      ) : null}

      {props.fileList?.length ? (
        <div className="flex min-w-0 items-center justify-between gap-2 text-sm text-muted-foreground">
          <ul className="min-w-0 flex-1 flex flex-col gap-1">
            {props.fileList.map((file) => {
              const displayName = file.name ?? file.blobFile?.name ?? '';

              return (
                <li
                  key={String(file.fileKey ?? file.name)}
                  className="truncate"
                  title={displayName}
                >
                  {displayName}
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className="shrink-0 text-destructive hover:underline"
            onClick={handleClear}
            disabled={props.disabled}
          >
            حذف
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default UploadField;
