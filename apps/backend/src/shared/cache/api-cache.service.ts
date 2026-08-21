import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RedisService } from '@/shared/redis/redis.service';

interface IMemoryEntry {
  readonly value: string;
  readonly expiresAt: number;
}

const MEMORY_MAX_ENTRIES = 500;
const VERSION_MEMORY_TTL_SECONDS = 60 * 60;
const DEFAULT_VERSION_SEED_TTL_SECONDS = 60;
const REDIS_HIT_MEMORY_TTL_SECONDS = 90;

@Injectable()
export class ApiCacheService {
  private readonly logger = new Logger(ApiCacheService.name);
  private readonly memory = new Map<string, IMemoryEntry>();
  private readonly keyPrefix: string;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.keyPrefix =
      this.configService.get<string>('redis.apiCachePrefix')?.trim() || 'helali';
  }

  /**
   * Cache version for a namespace. Memory-first: never blocks on Redis when
   * a local value exists. Seeds default `1` in memory so flaky Redis cannot
   * add a round-trip to every list request.
   */
  async getVersion(namespace: string): Promise<number> {
    const key = this.versionKey(namespace);
    const fromMemory = this.readMemory(key);

    if (fromMemory) {
      return this.parseVersion(fromMemory);
    }

    if (!this.redisService.isCircuitOpen()) {
      const fromRedis = await this.readRedis(key);

      if (fromRedis) {
        this.writeMemory(key, fromRedis, VERSION_MEMORY_TTL_SECONDS);
        return this.parseVersion(fromRedis);
      }
    }

    this.writeMemory(key, '1', DEFAULT_VERSION_SEED_TTL_SECONDS);
    return 1;
  }

  async bumpVersion(namespace: string): Promise<void> {
    const key = this.versionKey(namespace);
    const isReady = await this.redisService.ensureReady();

    if (isReady) {
      try {
        const next = await this.redisService.getClient().incr(key);
        this.writeMemory(key, String(next), VERSION_MEMORY_TTL_SECONDS);
        return;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'unknown';
        this.logger.warn(`Cache bump failed for ${namespace}: ${message}`);
      }
    }

    const current = this.readMemory(key);
    const next = (current ? this.parseVersion(current) : 1) + 1;
    this.writeMemory(key, String(next), VERSION_MEMORY_TTL_SECONDS);
  }

  async getOrSet<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
    const scopedKey = this.scopeKey(key);
    const cached = await this.readRaw(scopedKey);

    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch {
        // fall through to recompute
      }
    }

    const value = await factory();
    await this.writeRaw(scopedKey, JSON.stringify(value), ttlSeconds);
    return value;
  }

  private versionKey(namespace: string): string {
    return this.scopeKey(`helali:ver:${namespace}`);
  }

  /**
   * Prefixes cache keys so environments that share Redis (local + prod)
   * do not overwrite each other's URL payloads.
   */
  private scopeKey(key: string): string {
    const prefix = this.keyPrefix;
    if (!prefix || prefix === 'helali') {
      return key;
    }

    if (key.startsWith(`${prefix}:`)) {
      return key;
    }

    if (key.startsWith('helali:')) {
      return `${prefix}:${key.slice('helali:'.length)}`;
    }

    return `${prefix}:${key}`;
  }

  private parseVersion(raw: string): number {
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }

  private async readRaw(key: string): Promise<string | null> {
    const memoryHit = this.readMemory(key);

    if (memoryHit) {
      return memoryHit;
    }

    return this.readRedis(key);
  }

  private readMemory(key: string): string | null {
    const entry = this.memory.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.memory.delete(key);
      return null;
    }

    return entry.value;
  }

  private async readRedis(key: string): Promise<string | null> {
    if (this.redisService.isCircuitOpen() && !this.redisService.isAvailable()) {
      return null;
    }

    if (this.redisService.isAvailable()) {
      try {
        const value = await this.redisService.getClient().get(key);

        if (value) {
          this.writeMemory(key, value, REDIS_HIT_MEMORY_TTL_SECONDS);
        }

        return value;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'unknown';
        this.logger.warn(`Cache get failed for ${key}: ${message}`);
        return null;
      }
    }

    const isReady = await this.redisService.ensureReady();

    if (!isReady) {
      return null;
    }

    try {
      const value = await this.redisService.getClient().get(key);

      if (value) {
        this.writeMemory(key, value, REDIS_HIT_MEMORY_TTL_SECONDS);
      }

      return value;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'unknown';
      this.logger.warn(`Cache get failed for ${key}: ${message}`);
      return null;
    }
  }

  private async writeRaw(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.writeMemory(key, value, ttlSeconds);

    if (this.redisService.isCircuitOpen() && !this.redisService.isAvailable()) {
      return;
    }

    const isReady = this.redisService.isAvailable()
      ? true
      : await this.redisService.ensureReady();

    if (!isReady) {
      return;
    }

    try {
      await this.redisService.getClient().set(key, value, 'EX', ttlSeconds);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'unknown';
      this.logger.warn(`Cache set failed for ${key}: ${message}`);
    }
  }

  private writeMemory(key: string, value: string, ttlSeconds: number): void {
    if (this.memory.size >= MEMORY_MAX_ENTRIES) {
      const oldest = this.memory.keys().next().value;

      if (oldest) {
        this.memory.delete(oldest);
      }
    }

    this.memory.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
}
