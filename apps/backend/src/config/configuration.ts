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
}));
