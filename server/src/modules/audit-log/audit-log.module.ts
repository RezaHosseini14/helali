import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogService } from './auditLog.service';
import { AuditLogMiddleware } from './audit-log.middleware';
import { AuditLogController } from './auditLog.controller';

@Module({
  imports: [
    JwtModule.register({ secret: 'secret', signOptions: { expiresIn: '1d' } }),
  ],
  controllers: [AuditLogController],
  providers: [AuditLogService],
})
export class AuditLogModule {}
