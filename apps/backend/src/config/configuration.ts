import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => {
  const port = parseInt(String(process.env.BACKEND_PORT ?? process.env.PORT ?? '4000'), 10);

  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port,
    corsOrigin: process.env.CORS_ORIGIN ?? process.env.CORS_URL ?? 'http://localhost:3000',
    cookieSecure: process.env.COOKIE_SECURE === 'true',
    publicUrl:
      process.env.BACKEND_PUBLIC_URL?.replace(/\/$/, '') ||
      process.env.PUBLIC_BACKEND_URL?.replace(/\/$/, '') ||
      `http://localhost:${port}`,
  };
});

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET ?? process.env.ACCESS_TOKEN_SECRET ?? '',
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? process.env.REFRESH_TOKEN_SECRET ?? '',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '12h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
}));

export const redisConfig = registerAs('redis', () => ({
  url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  /** Isolates BullMQ keys so local dev workers do not steal production transcode jobs. */
  bullPrefix: process.env.BULLMQ_PREFIX?.trim() || 'helali',
  /**
   * Isolates API response cache when local/prod share one Redis.
   * Without this, local STORAGE_DRIVER=local poisons prod stories with localhost URLs.
   */
  apiCachePrefix:
    process.env.API_CACHE_PREFIX?.trim() ||
    process.env.BULLMQ_PREFIX?.trim() ||
    'helali',
}));

/** RSS fallback instances (primary source is FxTwitter API); see https://status.d420.de/ */
const DEFAULT_TWEETS_FEED_INSTANCES = [
  'https://nitter.poast.org',
  'https://nitter.privacyredirect.com',
  'https://nitter.tiekoetter.com',
  'https://nitter.net',
  'https://nitter.catsarch.com',
  'https://xcancel.com',
];

export const tweetsConfig = registerAs('tweets', () => {
  const rawInstances = process.env.TWEETS_FEED_INSTANCES?.trim();
  const feedInstances = rawInstances
    ? rawInstances
        .split(',')
        .map((value) => value.trim().replace(/\/$/, ''))
        .filter((value) => value.length > 0)
    : DEFAULT_TWEETS_FEED_INSTANCES;

  return {
    username: process.env.TWEETS_USERNAME?.trim() || 'helalireza',
    syncCron: process.env.TWEETS_SYNC_CRON?.trim() || '0 6 * * *',
    feedInstances,
  };
});
