"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const audit_logs_module_1 = require("./features/audit-logs/audit-logs.module");
const configuration_1 = require("./config/configuration");
const env_validation_1 = require("./config/env.validation");
const minio_config_1 = require("./config/minio.config");
const storage_config_1 = require("./config/storage.config");
const audio_module_1 = require("./features/audio/audio.module");
const auth_module_1 = require("./features/auth/auth.module");
const categories_module_1 = require("./features/categories/categories.module");
const comments_module_1 = require("./features/comments/comments.module");
const dashboard_module_1 = require("./features/dashboard/dashboard.module");
const gallery_module_1 = require("./features/gallery/gallery.module");
const health_module_1 = require("./features/health/health.module");
const users_module_1 = require("./features/users/users.module");
const video_module_1 = require("./features/video/video.module");
const global_exception_filter_1 = require("./shared/filters/global-exception.filter");
const casl_guard_1 = require("./shared/guards/casl.guard");
const jwt_auth_guard_1 = require("./shared/guards/jwt-auth.guard");
const auth_cookie_interceptor_1 = require("./shared/interceptors/auth-cookie.interceptor");
const logging_interceptor_1 = require("./shared/interceptors/logging.interceptor");
const response_mapping_interceptor_1 = require("./shared/interceptors/response-mapping.interceptor");
const prisma_module_1 = require("./shared/prisma/prisma.module");
const redis_module_1 = require("./shared/redis/redis.module");
const storage_module_1 = require("./shared/storage/storage.module");
const isProduction = process.env.NODE_ENV === 'production';
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: [
                    (0, path_1.join)(__dirname, '../.env'),
                    (0, path_1.join)(process.cwd(), '.env'),
                    (0, path_1.join)(process.cwd(), '../../.env'),
                ],
                load: [configuration_1.appConfig, configuration_1.jwtConfig, configuration_1.redisConfig, minio_config_1.minioConfig, storage_config_1.storageConfig],
                validate: env_validation_1.validateEnvironment,
            }),
            audit_logs_module_1.AuditLogsModule,
            throttler_1.ThrottlerModule.forRoot({
                skipIf: () => !isProduction,
                throttlers: [
                    {
                        ttl: 60_000,
                        limit: 100,
                    },
                ],
            }),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            storage_module_1.StorageModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            audio_module_1.AudioModule,
            video_module_1.VideoModule,
            gallery_module_1.GalleryModule,
            categories_module_1.CategoriesModule,
            comments_module_1.CommentsModule,
            dashboard_module_1.DashboardModule,
        ],
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: global_exception_filter_1.GlobalExceptionFilter,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: casl_guard_1.CaslGuard,
            },
            ...(isProduction
                ? [
                    {
                        provide: core_1.APP_GUARD,
                        useClass: throttler_1.ThrottlerGuard,
                    },
                ]
                : []),
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: logging_interceptor_1.LoggingInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: auth_cookie_interceptor_1.AuthCookieInterceptor,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: response_mapping_interceptor_1.ResponseMappingInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map