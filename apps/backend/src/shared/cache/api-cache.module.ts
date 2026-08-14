import { Global, Module } from '@nestjs/common';

import { ApiCacheService } from '@/shared/cache/api-cache.service';
import { RedisModule } from '@/shared/redis/redis.module';

@Global()
@Module({
  imports: [RedisModule],
  providers: [ApiCacheService],
  exports: [ApiCacheService],
})
export class ApiCacheModule {}
