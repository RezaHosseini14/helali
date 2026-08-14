import { BadRequestException } from '@nestjs/common';

import {
  getMaxUploadSizeBytesForMimeType,
  isAllowedAudioMimeType,
  isAllowedImageMimeType,
  isAllowedVideoMimeType,
  normalizeMediaFilename,
  resolveMimeTypeFromUpload,
  type HelaliMediaKind,
} from '@helali/shared';

import { TypeErrorMessage } from '@/shared/constants/messages';

import { detectFileSignature, doesSignatureMatchMime } from './file-signature';

export interface IValidatedUploadFile {
  readonly buffer: Buffer;
  readonly size: number;
  readonly mimetype: string;
  readonly originalName: string;
  readonly kind: HelaliMediaKind;
}

function assertNonEmptyFile(file: Express.Multer.File | undefined): asserts file is Express.Multer.File {
  if (!file || !file.buffer || file.size === 0) {
    throw new BadRequestException('فایل آپلود نشده است');
  }
}

function resolveKindOrThrow(mimeType: string, kind: HelaliMediaKind): HelaliMediaKind {
  const isAllowed =
    kind === 'image'
      ? isAllowedImageMimeType(mimeType)
      : kind === 'audio'
        ? isAllowedAudioMimeType(mimeType)
        : isAllowedVideoMimeType(mimeType);

  if (!isAllowed) {
    if (kind === 'audio') {
      throw new BadRequestException(TypeErrorMessage.AudioTypeError);
    }

    if (kind === 'video') {
      throw new BadRequestException(TypeErrorMessage.VideoTypeError);
    }

    throw new BadRequestException(TypeErrorMessage.PosterTypeError);
  }

  return kind;
}

export function validateUploadFile(
  file: Express.Multer.File | undefined,
  expectedKind: HelaliMediaKind,
): IValidatedUploadFile {
  assertNonEmptyFile(file);

  const originalName = normalizeMediaFilename(file.originalname || 'upload');
  const mimetype = resolveMimeTypeFromUpload(file.mimetype || '', originalName);
  const kind = resolveKindOrThrow(mimetype, expectedKind);
  const maxSize = getMaxUploadSizeBytesForMimeType(mimetype);

  if (file.size > maxSize) {
    throw new BadRequestException('حجم فایل از حد مجاز بیشتر است');
  }

  const detected = detectFileSignature(file.buffer);

  if (!doesSignatureMatchMime(detected, mimetype)) {
    throw new BadRequestException('نوع فایل با محتوای آن هم‌خوانی ندارد');
  }

  return {
    buffer: file.buffer,
    size: file.size,
    mimetype,
    originalName,
    kind,
  };
}
