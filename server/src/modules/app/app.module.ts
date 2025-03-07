import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { AuditLogMiddleware } from '../audit-log/audit-log.middleware';
import { AudioModule } from '../audio/audio.module';
import { GalleryModule } from '../gallery/gallery.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from '../comments/comments.module';
import { VideoModule } from '../video/video.module';
import { CategoryModule } from '../category/category.module';
import { CustomConfigModule } from '../config/config.module';
import { TypeOrmDbConfig } from 'src/config/typeorm.config';

@Module({
  imports: [
    CustomConfigModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmDbConfig,
      inject: [TypeOrmDbConfig],
    }),
    CommentsModule,
    UserModule,
    AuthModule,
    AudioModule,
    GalleryModule,
    VideoModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService, TypeOrmDbConfig],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuditLogMiddleware).forRoutes('*');
  }
}
