import type { HelaliMediaKind } from '@helali/shared';
import {
  ALLOWED_AUDIO_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  getMaxUploadSizeBytesForMediaKind,
  resolveMimeTypeFromUpload,
} from '@helali/shared';

export interface IFileValidationError {
  readonly message: string;
}

const ACCEPT_BY_KIND: Readonly<Record<HelaliMediaKind, string>> = {
  image: ALLOWED_IMAGE_MIME_TYPES.join(','),
  audio: ALLOWED_AUDIO_MIME_TYPES.join(','),
  video: ALLOWED_VIDEO_MIME_TYPES.join(','),
};

export function getAcceptAttribute(kind: HelaliMediaKind): string {
  if (kind === 'audio') {
    return 'audio/mpeg,audio/mp3,.mp3';
  }

  return ACCEPT_BY_KIND[kind];
}

export function validateClientFile(
  file: File,
  expectedKind: HelaliMediaKind,
): IFileValidationError | null {
  const mimeType = resolveMimeTypeFromUpload(file.type || '', file.name);
  const maxSize = getMaxUploadSizeBytesForMediaKind(expectedKind);

  const allowed =
    expectedKind === 'image'
      ? (ALLOWED_IMAGE_MIME_TYPES as ReadonlyArray<string>).includes(mimeType)
      : expectedKind === 'audio'
        ? (ALLOWED_AUDIO_MIME_TYPES as ReadonlyArray<string>).includes(mimeType)
        : (ALLOWED_VIDEO_MIME_TYPES as ReadonlyArray<string>).includes(mimeType);

  if (!allowed) {
    if (expectedKind === 'audio') {
      return { message: 'فایل صوتی باید mp3 باشد' };
    }

    if (expectedKind === 'video') {
      return { message: 'فایل ویدیو باید mp4، webm یا mov باشد' };
    }

    return { message: 'فایل تصویر باید jpeg، png یا webp باشد' };
  }

  if (file.size > maxSize) {
    return { message: 'حجم فایل از حد مجاز بیشتر است' };
  }

  if (file.size === 0) {
    return { message: 'فایل خالی است' };
  }

  return null;
}
