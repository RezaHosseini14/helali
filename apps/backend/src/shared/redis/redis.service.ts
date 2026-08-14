import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

const CONNECT_TIMEOUT_MS = 1_500;
const CIRCUIT_COOLDOWN_MS = 30_000;
const CONNECT_WAIT_TIMEOUT_MS = 1_500;

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly redisUrl: string;
  private readonly logger = new Logger(RedisService.name);
  private connectLock: Promise<boolean> | null = null;
  private circuitOpenUntil = 0;

  constructor(private readonly configService: ConfigService) {
    this.redisUrl =
      this.configService.get<string>('redis.url') ??
      process.env.REDIS_URL ??
      'redis://localhost:6379';

    this.client = this.createClient();
  }

  getClient(): Redis {
    return this.client;
  }

  /** Sync check — never blocks the request path. */
  isAvailable(): boolean {
    return this.client.status === 'ready' && !this.isCircuitOpen();
  }

  isCircuitOpen(): boolean {
    return Date.now() < this.circuitOpenUntil;
  }

  async onModuleInit(): Promise<void> {
    const ready = await this.ensureReady();

    if (ready) {
      this.logger.log('Redis ready');
    } else {
      this.logger.warn('Redis unavailable at startup — using memory cache fallback');
    }
  }

  /**
   * Ensures Redis is usable. When the circuit is open after a failure,
   * returns immediately (no reconnect storm / 2s timeouts per request).
   */
  async ensureReady(): Promise<boolean> {
    if (this.isCircuitOpen()) {
      return false;
    }

    if (this.client.status === 'ready') {
      return true;
    }

    if (this.connectLock) {
      return this.connectLock;
    }

    this.connectLock = this.connectOrRecreate();

    try {
      const ready = await this.connectLock;

      if (!ready) {
        this.openCircuit('connect failed');
      }

      return ready;
    } finally {
      this.connectLock = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status === 'wait') {
      this.client.disconnect();
      return;
    }

    try {
      await this.client.quit();
    } catch {
      this.client.disconnect();
    }
  }

  private openCircuit(reason: string): void {
    this.circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
    this.logger.warn(
      `Redis circuit open for ${CIRCUIT_COOLDOWN_MS / 1000}s (${reason}) — memory cache only`,
    );
  }

  private createClient(): Redis {
    const client = new Redis(this.redisUrl, {
      lazyConnect: true,
      connectTimeout: CONNECT_TIMEOUT_MS,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (attempt: number) => {
        if (attempt > 3) {
          return null;
        }

        return Math.min(attempt * 200, 1_000);
      },
    });

    client.on('error', (error: Error) => {
      this.logger.warn(`Redis connection error: ${error.message}`);
      this.openCircuit(error.message);
    });

    client.on('end', () => {
      this.openCircuit('connection ended');
    });

    return client;
  }

  private async connectOrRecreate(): Promise<boolean> {
    if (this.client.status === 'end' || this.client.status === 'close') {
      try {
        this.client.disconnect(false);
      } catch {
        // already closed
      }
      this.client = this.createClient();
    }

    if (this.client.status === 'ready') {
      return true;
    }

    try {
      if (this.client.status === 'wait') {
        await this.withTimeout(this.client.connect(), CONNECT_WAIT_TIMEOUT_MS, 'connect');
      } else if (this.client.status === 'connecting' || this.client.status === 'reconnecting') {
        await this.withTimeout(
          new Promise<void>((resolve, reject) => {
            const onReady = () => {
              cleanup();
              resolve();
            };
            const onError = (error: Error) => {
              cleanup();
              reject(error);
            };
            const cleanup = () => {
              this.client.off('ready', onReady);
              this.client.off('error', onError);
            };

            this.client.once('ready', onReady);
            this.client.once('error', onError);
          }),
          CONNECT_WAIT_TIMEOUT_MS,
          'wait-ready',
        );
      }

      return (this.client.status as string) === 'ready';
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'unknown redis error';
      this.logger.warn(`Redis connect failed: ${message}`);
      return false;
    }
  }

  private withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Redis ${label} timed out after ${ms}ms`));
      }, ms);

      promise
        .then((value) => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch((error: unknown) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
}
