import { Module } from '@nestjs/common';

import { AuthModule } from '@/features/auth/auth.module';
import { AuditLogsModule } from '@/features/audit-logs/audit-logs.module';

import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [AuthModule, AuditLogsModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
