import { Global, Module } from '@nestjs/common';

import { MediaDailyStatService } from './media-daily-stat.service';

@Global()
@Module({
  providers: [MediaDailyStatService],
  exports: [MediaDailyStatService],
})
export class MediaStatsModule {}
