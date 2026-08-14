import { memoryStorage } from 'multer';

import {
  MAX_AUDIO_UPLOAD_SIZE_BYTES,
  MAX_IMAGE_UPLOAD_SIZE_BYTES,
  MAX_VIDEO_UPLOAD_SIZE_BYTES,
} from '@helali/shared';

const AUDIO_WITH_POSTER_MAX = Math.max(MAX_AUDIO_UPLOAD_SIZE_BYTES, MAX_IMAGE_UPLOAD_SIZE_BYTES);
const VIDEO_WITH_POSTER_MAX = Math.max(MAX_VIDEO_UPLOAD_SIZE_BYTES, MAX_IMAGE_UPLOAD_SIZE_BYTES);

const memoryUploadStorage = memoryStorage();

/** Nest Multer options — keep shape loose to avoid @types/multer vs Nest MulterOptions clash. */
interface IHelaliMulterOptions {
  readonly storage: ReturnType<typeof memoryStorage>;
  readonly limits: {
    readonly fileSize: number;
    readonly files: number;
  };
}

export const galleryUploadMulterOptions: IHelaliMulterOptions = {
  storage: memoryUploadStorage,
  limits: {
    fileSize: MAX_IMAGE_UPLOAD_SIZE_BYTES,
    files: 1,
  },
};

export const audioUploadMulterOptions: IHelaliMulterOptions = {
  storage: memoryUploadStorage,
  limits: {
    fileSize: AUDIO_WITH_POSTER_MAX,
    files: 2,
  },
};

export const videoUploadMulterOptions: IHelaliMulterOptions = {
  storage: memoryUploadStorage,
  limits: {
    fileSize: VIDEO_WITH_POSTER_MAX,
    files: 2,
  },
};
