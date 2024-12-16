import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AuditLogMiddleware } from '../audit-log/audit-log.middleware';
import { AudioModule } from '../audio/audio.module';
import { GalleryModule } from '../gallery/gallery.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from '../comments/comments.module';
import { VideoModule } from '../video/video.module';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '192.168.248.129',
      port: 5432,
      username: 'root',
      password: 'root',
      database: 'helali_database',
      autoLoadEntities: true,
      entities: [],
      synchronize: true,
    }),
    CommentsModule,
    UserModule,
    AuthModule,
    AudioModule,
    // AuditLogModule,
    GalleryModule,
    VideoModule,
    CategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuditLogMiddleware).forRoutes('*');
  }
}
