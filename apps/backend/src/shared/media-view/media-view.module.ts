import { Global, Module } from '@nestjs/common';

import { MediaViewService } from './media-view.service';

@Global()
@Module({
  providers: [MediaViewService],
  exports: [MediaViewService],
})
export class MediaViewModule {}
