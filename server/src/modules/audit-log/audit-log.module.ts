import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, auditLogSchema } from 'src/schemas/AuditLog.schema';
import { AuditLogService } from './auditLog.service';
import { AuditLogMiddleware } from './audit-log.middleware';
import { AuditLogController } from './auditLog.controller';

@Module({
  imports: [
    JwtModule.register({ secret: 'secret', signOptions: { expiresIn: '1d' } }),
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: auditLogSchema },
    ]),
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService],
})
export class AuditLogModule {}
