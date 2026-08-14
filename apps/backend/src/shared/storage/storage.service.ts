import { createWriteStream } from 'node:fs';
import { access, mkdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import * as http from 'node:http';

import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

import type { StorageDriver } from '@/config/storage.config';

export interface IStorageUploadInput {
  readonly buffer: Buffer;
  readonly size: number;
  readonly mimetype: string;
  readonly objectName: string;
}

const MAX_PUT_ATTEMPTS = 5;
const RETRY_BASE_DELAY_MS = 700;

function isTransientStorageError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code =
    'code' in error && typeof (error as { code?: unknown }).code === 'string'
      ? (error as { code: string }).code
      : '';
  const message = error instanceof Error ? error.message : String(error);
  const normalized = `${code} ${message}`.toLowerCase();

  return (
    normalized.includes('econnreset') ||
    normalized.includes('etimedout') ||
    normalized.includes('econnrefused') ||
    normalized.includes('epipe') ||
    normalized.includes('socket hang up') ||
    normalized.includes('network') ||
    normalized.includes('timeout') ||
    normalized.includes('aborted')
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

interface ICachedUrl {
  readonly url: string;
  readonly expiresAt: number;
}

/** Refresh signed URLs well before MinIO expiry (24h). */
const URL_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly driver: StorageDriver;
  private readonly localRoot: string;
  private readonly publicBaseUrl: string;
  private readonly minioClient: Client | null;
  private readonly ensuredBuckets = new Set<string>();
  private readonly urlCache = new Map<string, ICachedUrl>();

  constructor(private readonly configService: ConfigService) {
    this.driver = this.configService.get<StorageDriver>('storage.driver', 'local');
    this.localRoot = this.configService.get<string>('storage.localPath', 'storage');
    this.publicBaseUrl = (
      this.configService.get<string>('app.publicUrl') ||
      `http://localhost:${this.configService.get<number>('app.port') ?? 4000}`
    ).replace(/\/$/, '');

    if (this.driver === 'minio') {
      const endPoint = this.configService.get<string>('minio.endpoint', 'localhost');
      const port = this.configService.get<number>('minio.port', 9000);
      const useSSL = this.configService.get<boolean>('minio.useSsl', false);
      const agent = new http.Agent({
        keepAlive: true,
        keepAliveMsecs: 30_000,
        maxSockets: 8,
        timeout: 300_000,
      });

      this.minioClient = new Client({
        endPoint,
        port,
        useSSL,
        accessKey: this.configService.get<string>('minio.accessKey', ''),
        secretKey: this.configService.get<string>('minio.secretKey', ''),
        region: 'us-east-1',
        pathStyle: true,
        transportAgent: agent,
        retryOptions: {
          maximumRetryCount: 5,
          baseDelayMs: 500,
          maximumDelayMs: 8_000,
        },
      });
    } else {
      this.minioClient = null;
      this.logger.log(`Storage driver: local (${this.localRoot})`);
    }
  }

  getLocalRootAbsolute(): string {
    return join(process.cwd(), this.localRoot);
  }

  async uploadFile(bucketName: string, file: Express.Multer.File) {
    return this.putObject(bucketName, {
      objectName: file.originalname,
      buffer: file.buffer,
      size: file.size,
      mimetype: file.mimetype,
    });
  }

  async putObject(bucketName: string, input: IStorageUploadInput) {
    if (this.driver === 'local') {
      return this.putObjectLocal(bucketName, input);
    }

    return this.putObjectMinio(bucketName, input);
  }

  async putObjects(
    uploads: ReadonlyArray<{ readonly bucketName: string; readonly input: IStorageUploadInput }>,
  ) {
    // Sequential: parallel puts amplify flaky remote MinIO ECONNRESET.
    for (const item of uploads) {
      await this.putObject(item.bucketName, item.input);
    }
  }

  async createBucket(bucketName: string): Promise<void> {
    if (this.ensuredBuckets.has(bucketName)) {
      return;
    }

    if (this.driver === 'local') {
      await mkdir(join(this.getLocalRootAbsolute(), bucketName), { recursive: true });
      this.ensuredBuckets.add(bucketName);
      return;
    }

    const client = this.requireMinio();
    const exists = await client.bucketExists(bucketName);
    if (!exists) {
      await client.makeBucket(bucketName, 'us-east-1');
    }

    this.ensuredBuckets.add(bucketName);
  }

  async listFiles(bucketName: string): Promise<Array<{ name?: string; size?: number }>> {
    if (this.driver === 'local') {
      return [];
    }

    const client = this.requireMinio();
    const items: Array<{ name?: string; size?: number }> = [];
    const stream = client.listObjects(bucketName, '', true);

    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => items.push(obj));
      stream.on('error', (err) => reject(err));
      stream.on('end', () => resolve(items));
    });
  }

  async getPresignedUrl(
    bucketName: string,
    fileName: string,
    expiresIn: number,
  ): Promise<string> {
    if (this.driver === 'local') {
      return `${this.publicBaseUrl}/files/${bucketName}/${encodeURIComponent(fileName)}`;
    }

    const cacheKey = `${bucketName}:${fileName}`;
    const cached = this.urlCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.url;
    }

    try {
      const url = await this.requireMinio().presignedGetObject(bucketName, fileName, expiresIn);
      this.urlCache.set(cacheKey, {
        url,
        expiresAt: Date.now() + Math.min(URL_CACHE_TTL_MS, Math.max(expiresIn - 60, 60) * 1000),
      });
      return url;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown presign error';
      throw new Error(`Error generating presigned URL: ${message}`);
    }
  }

  invalidateUrlCache(bucketName: string, fileName: string): void {
    this.urlCache.delete(`${bucketName}:${fileName}`);
  }

  async deleteFile(bucketName: string, fileName: string) {
    if (this.driver === 'local') {
      await this.deleteLocalQuiet(bucketName, fileName);
      return { message: 'File deleted successfully' };
    }

    try {
      await this.requireMinio().removeObject(bucketName, fileName);
      return { message: 'File deleted successfully' };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown delete error';
      this.logger.error(`Delete failed: ${message}`);
      throw new HttpException(`File delete failed: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteFiles(
    deletions: ReadonlyArray<{ readonly bucketName: string; readonly fileName: string }>,
  ): Promise<void> {
    await Promise.all(
      deletions.map(async (item) => {
        try {
          if (this.driver === 'local') {
            await this.deleteLocalQuiet(item.bucketName, item.fileName);
            return;
          }

          await this.requireMinio().removeObject(item.bucketName, item.fileName);
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown delete error';
          this.logger.warn(`Rollback delete failed for ${item.fileName}: ${message}`);
        }
      }),
    );
  }

  private async putObjectLocal(bucketName: string, input: IStorageUploadInput) {
    try {
      const dir = join(this.getLocalRootAbsolute(), bucketName);
      await mkdir(dir, { recursive: true });
      const filePath = join(dir, input.objectName);
      await pipeline(Readable.from(input.buffer), createWriteStream(filePath));
      return { message: 'File uploaded successfully', objectName: input.objectName };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown upload error';
      this.logger.error(`Local upload failed: ${message}`);
      throw new HttpException(`File upload failed: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async putObjectMinio(bucketName: string, input: IStorageUploadInput) {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_PUT_ATTEMPTS; attempt += 1) {
      try {
        await this.createBucket(bucketName);

        await this.requireMinio().putObject(
          bucketName,
          input.objectName,
          input.buffer,
          input.size,
          {
            'Content-Type': input.mimetype,
          },
        );

        return { message: 'File uploaded successfully', objectName: input.objectName };
      } catch (error: unknown) {
        lastError = error;
        const message = error instanceof Error ? error.message : 'Unknown upload error';

        if (attempt < MAX_PUT_ATTEMPTS && isTransientStorageError(error)) {
          const waitMs = RETRY_BASE_DELAY_MS * attempt;
          this.logger.warn(
            `Upload attempt ${attempt}/${MAX_PUT_ATTEMPTS} failed for ${input.objectName}: ${message}. Retry in ${waitMs}ms`,
          );
          await delay(waitMs);
          continue;
        }

        this.logger.error(`Upload failed: ${message}`);
        throw new HttpException(`File upload failed: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }

    const message = lastError instanceof Error ? lastError.message : 'Unknown upload error';
    throw new HttpException(`File upload failed: ${message}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  private async deleteLocalQuiet(bucketName: string, fileName: string): Promise<void> {
    const filePath = join(this.getLocalRootAbsolute(), bucketName, fileName);

    try {
      await access(filePath);
      await unlink(filePath);
    } catch {
      // ignore missing files during rollback
    }
  }

  private requireMinio(): Client {
    if (!this.minioClient) {
      throw new HttpException('MinIO client is not configured', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.minioClient;
  }
}
