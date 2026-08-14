import { registerAs } from '@nestjs/config';

export const minioConfig = registerAs('minio', () => ({
  endpoint: process.env.MINIO_ENDPOINT ?? 'localhost',
  port: parseInt(process.env.MINIO_PORT ?? '9000', 10),
  accessKey: process.env.MINIO_ACCESS_KEY ?? '',
  secretKey: process.env.MINIO_SECRET_KEY ?? '',
  bucket: process.env.MINIO_BUCKET ?? 'helali-media',
  useSsl: process.env.MINIO_USE_SSL === 'true',
}));
