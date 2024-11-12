import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, auditLogSchema } from 'src/schemas/AuditLog.schema';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AuditLogMiddleware } from '../audit-log/audit-log.middleware';
import { AudioModule } from '../audio/audio.module';
import { GalleryModule } from '../gallery/gallery.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    MongooseModule.forRoot('mongodb://localhost/helali'),
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: auditLogSchema },
    ]),
    UserModule,
    AuthModule,
    AuditLogModule,
    AudioModule,
    GalleryModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuditLogMiddleware).forRoutes('*');
  }
}
