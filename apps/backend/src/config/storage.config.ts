import { registerAs } from '@nestjs/config';

export type StorageDriver = 'local' | 'minio';

function resolveStorageDriver(): StorageDriver {
  const explicitDriver = process.env.STORAGE_DRIVER?.trim().toLowerCase();

  if (explicitDriver === 'local' || explicitDriver === 'minio') {
    return explicitDriver;
  }

  const nodeEnv = process.env.NODE_ENV ?? 'development';
  return nodeEnv === 'production' ? 'minio' : 'local';
}

export const storageConfig = registerAs('storage', () => ({
  driver: resolveStorageDriver(),
  localPath: process.env.STORAGE_LOCAL_PATH ?? 'storage',
}));
