import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AuditLogsModule } from '@/features/audit-logs/audit-logs.module';
import { appConfig, jwtConfig, redisConfig, tweetsConfig } from '@/config/configuration';
import { validateEnvironment } from '@/config/env.validation';
import { minioConfig } from '@/config/minio.config';
import { storageConfig } from '@/config/storage.config';
import { AudioModule } from '@/features/audio/audio.module';
import { AuthModule } from '@/features/auth/auth.module';
import { CategoriesModule } from '@/features/categories/categories.module';
import { CommentsModule } from '@/features/comments/comments.module';
import { DashboardModule } from '@/features/dashboard/dashboard.module';
import { GalleryModule } from '@/features/gallery/gallery.module';
import { HealthModule } from '@/features/health/health.module';
import { TweetsModule } from '@/features/tweets/tweets.module';
import { RolesModule } from '@/features/roles/roles.module';
import { UsersModule } from '@/features/users/users.module';
import { VideoModule } from '@/features/video/video.module';
import { GlobalExceptionFilter } from '@/shared/filters/global-exception.filter';
import { CaslGuard } from '@/shared/guards/casl.guard';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { AuthCookieInterceptor } from '@/shared/interceptors/auth-cookie.interceptor';
import { LoggingInterceptor } from '@/shared/interceptors/logging.interceptor';
import { ResponseMappingInterceptor } from '@/shared/interceptors/response-mapping.interceptor';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { MediaViewModule } from '@/shared/media-view/media-view.module';
import { MediaStatsModule } from '@/shared/media-stats/media-stats.module';
import { ApiCacheModule } from '@/shared/cache/api-cache.module';
import { RedisModule } from '@/shared/redis/redis.module';
import { StorageModule } from '@/shared/storage/storage.module';
import { MediaProcessingModule } from '@/features/media-processing/media-processing.module';


const isProduction = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '../.env'),
        join(process.cwd(), '.env'),
        join(process.cwd(), '../../.env'),
      ],
      load: [appConfig, jwtConfig, redisConfig, tweetsConfig, minioConfig, storageConfig],
      validate: validateEnvironment,
    }),
    ScheduleModule.forRoot(),
    AuditLogsModule,
    ThrottlerModule.forRoot({
      // Evaluate at request time so .env NODE_ENV is respected after bootstrap.
      skipIf: () => process.env.NODE_ENV !== 'production',
      throttlers: [
        {
          ttl: 60_000,
          limit: 100,
        },
      ],
    }),
    PrismaModule,
    RedisModule,
    ApiCacheModule,
    MediaViewModule,
    MediaStatsModule,
    StorageModule,
    HealthModule,
    AuthModule,
    RolesModule,
    UsersModule,
    AudioModule,
    VideoModule,
    GalleryModule,
    CategoriesModule,
    CommentsModule,
    DashboardModule,
    MediaProcessingModule,
    TweetsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CaslGuard,
    },
    ...(isProduction
      ? [
          {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
          },
        ]
      : []),
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthCookieInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseMappingInterceptor,
    },
  ],
})
export class AppModule {}
