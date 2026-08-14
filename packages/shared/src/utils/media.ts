import {
  ALLOWED_AUDIO_MIME_TYPES,
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  MAX_AUDIO_UPLOAD_SIZE_BYTES,
  MAX_IMAGE_UPLOAD_SIZE_BYTES,
  MAX_VIDEO_UPLOAD_SIZE_BYTES,
} from '../constants';

export type HelaliMediaKind = 'image' | 'audio' | 'video';

const EXTENSION_TO_MIME: Readonly<Record<string, string>> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
};

const MIME_TO_EXTENSION: Readonly<Record<string, string>> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'audio/mpeg': '.mp3',
};

const GENERIC_UPLOAD_MIME_TYPES = new Set(['', 'application/octet-stream', 'binary/octet-stream']);

const MOJIBAKE_PATTERN = /[ÃØÙÚÛÂÊÎÔÛà-ÿ]/;
const RTL_SCRIPT_PATTERN = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;

export function normalizeMediaFilename(filename: string): string {
  const trimmedFilename = filename.trim();

  if (!trimmedFilename) {
    return trimmedFilename;
  }

  if (trimmedFilename.includes('%')) {
    try {
      const decodedFilename = decodeURIComponent(trimmedFilename);

      if (decodedFilename && decodedFilename !== trimmedFilename) {
        return decodedFilename;
      }
    } catch {
      // Keep the original filename when URI decoding fails.
    }
  }

  if (typeof Buffer !== 'undefined') {
    const decodedFromLatin1 = Buffer.from(trimmedFilename, 'latin1').toString('utf8');
    const shouldPreferDecodedFilename =
      RTL_SCRIPT_PATTERN.test(decodedFromLatin1) &&
      (!RTL_SCRIPT_PATTERN.test(trimmedFilename) || MOJIBAKE_PATTERN.test(trimmedFilename));

    if (shouldPreferDecodedFilename && !decodedFromLatin1.includes('\uFFFD')) {
      return decodedFromLatin1;
    }
  }

  return trimmedFilename;
}

export function resolveMimeTypeFromUpload(mimeType: string, filename: string): string {
  const normalizedMimeType = mimeType.trim().toLowerCase();
  const aliasedMimeType = normalizedMimeType === 'audio/mp3' ? 'audio/mpeg' : normalizedMimeType;

  if (
    !GENERIC_UPLOAD_MIME_TYPES.has(aliasedMimeType) &&
    resolveMediaKindFromMime(aliasedMimeType)
  ) {
    return aliasedMimeType;
  }

  const extensionIndex = filename.lastIndexOf('.');

  if (extensionIndex === -1) {
    return aliasedMimeType;
  }

  const extension = filename.slice(extensionIndex).toLowerCase();
  return EXTENSION_TO_MIME[extension] ?? aliasedMimeType;
}

export function resolveMediaKindFromMime(mimeType: string): HelaliMediaKind | null {
  const normalizedMimeType = mimeType.trim().toLowerCase();

  if (
    ALLOWED_IMAGE_MIME_TYPES.includes(
      normalizedMimeType as (typeof ALLOWED_IMAGE_MIME_TYPES)[number],
    )
  ) {
    return 'image';
  }

  if (
    ALLOWED_VIDEO_MIME_TYPES.includes(
      normalizedMimeType as (typeof ALLOWED_VIDEO_MIME_TYPES)[number],
    )
  ) {
    return 'video';
  }

  if (
    ALLOWED_AUDIO_MIME_TYPES.includes(
      normalizedMimeType as (typeof ALLOWED_AUDIO_MIME_TYPES)[number],
    )
  ) {
    return 'audio';
  }

  return null;
}

export function isAllowedImageMimeType(mimeType: string): boolean {
  return resolveMediaKindFromMime(mimeType) === 'image';
}

export function isAllowedAudioMimeType(mimeType: string): boolean {
  return resolveMediaKindFromMime(mimeType) === 'audio';
}

export function isAllowedVideoMimeType(mimeType: string): boolean {
  return resolveMediaKindFromMime(mimeType) === 'video';
}

export function getExtensionForMime(mimeType: string): string {
  const normalizedMimeType = mimeType.trim().toLowerCase();
  return MIME_TO_EXTENSION[normalizedMimeType] ?? '.bin';
}

export function getMaxUploadSizeBytesForMediaKind(kind: HelaliMediaKind): number {
  switch (kind) {
    case 'image':
      return MAX_IMAGE_UPLOAD_SIZE_BYTES;
    case 'video':
      return MAX_VIDEO_UPLOAD_SIZE_BYTES;
    case 'audio':
      return MAX_AUDIO_UPLOAD_SIZE_BYTES;
    default:
      return MAX_IMAGE_UPLOAD_SIZE_BYTES;
  }
}

export function getMaxUploadSizeBytesForMimeType(mimeType: string): number {
  const kind = resolveMediaKindFromMime(mimeType);

  if (!kind) {
    return MAX_IMAGE_UPLOAD_SIZE_BYTES;
  }

  return getMaxUploadSizeBytesForMediaKind(kind);
}

export function buildSafeStorageFileName(mimeType: string, originalName?: string): string {
  const resolvedMime =
    originalName !== undefined
      ? resolveMimeTypeFromUpload(mimeType, originalName)
      : mimeType.trim().toLowerCase();
  const extension = getExtensionForMime(resolvedMime);
  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `${id}${extension}`;
}
