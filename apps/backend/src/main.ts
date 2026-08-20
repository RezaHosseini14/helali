import { join } from 'node:path';

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { createValidationPipe } from './shared/pipes/validation.pipe';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    rawBody: false,
  });

  const corsOrigin = process.env.CORS_ORIGIN ?? process.env.CORS_URL ?? 'http://localhost:3000';
  const storageRoot = join(process.cwd(), process.env.STORAGE_LOCAL_PATH ?? 'storage');

  app.enableCors({
    origin: corsOrigin.split(',').map((item) => item.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Helali-Encrypted'],
    exposedHeaders: [
      'X-Helali-Encrypted',
      'Content-Range',
      'Accept-Ranges',
      'Content-Length',
      'Content-Type',
    ],
  });

  app.use(compression());
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    }),
  );
  app.use(cookieParser());
  app.useStaticAssets(storageRoot, {
    prefix: '/files/',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.m3u8')) {
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res.setHeader('Cache-Control', 'public, max-age=60');
        return;
      }

      if (filePath.endsWith('.ts')) {
        res.setHeader('Content-Type', 'video/mp2t');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return;
      }

      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(createValidationPipe());

  const port = parseInt(process.env.BACKEND_PORT ?? process.env.PORT ?? '4000', 10);
  const server = await app.listen(port);

  server.on('clientError', (error: NodeJS.ErrnoException, socket) => {
    if (error.code === 'ECONNRESET' || error.code === 'EPIPE') {
      socket.destroy();
      return;
    }

    console.error('HTTP client error:', error);
    socket.destroy();
  });

  console.log(`Backend running on http://localhost:${port}/api/v1`);
  console.log(`Local media files: http://localhost:${port}/files/ (root=${storageRoot})`);
}

bootstrap();
