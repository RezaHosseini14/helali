export * from './roles';
export * from './permissions';
export * from './role-permissions';

export const MIN_PASSWORD_LENGTH = 6;

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

export const REFRESH_TOKEN_COOKIE = 'helali_refresh_token';

export const COMMENT_STATUSES = {
  PENDING: 'pending',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
} as const;

export const COMMENT_STATUS_VALUES = Object.values(COMMENT_STATUSES);

export const MINIO_BUCKETS = {
  AUDIO: 'audio-bucket',
  VIDEO: 'video-bucket',
  GALLERY: 'gallery-bucket',
  POSTER: 'poster-bucket',
} as const;

export const MAX_IMAGE_UPLOAD_SIZE_BYTES = 30 * 1024 * 1024;
export const MAX_AUDIO_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024;
export const MAX_VIDEO_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const ALLOWED_AUDIO_MIME_TYPES = ['audio/mpeg', 'audio/mp3'] as const;

export const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const;

export const ENCRYPTION_ALGORITHM = 'AES-GCM';
export const ENCRYPTION_VERSION = 1;
export const ENCRYPTION_IV_BYTES = 12;
export const ENCRYPTION_AUTH_TAG_BYTES = 16;
export const ENCRYPTION_KEY_BYTES = 32;
export const ENCRYPTION_HEADER = 'X-Helali-Encrypted';

export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export const SORT_ORDER_VALUES = Object.values(SORT_ORDERS);
