import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Pagination } from 'src/common/decorator/pagination.decorator';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'poster', maxCount: 1 },
    ]),
  )
  async uploadFile(
    @Body() createAudioDto: CreateVideoDto,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      poster?: Express.Multer.File[];
    },
  ) {
    const audioFile = files.file?.[0];
    const posterFile = files.poster?.[0];

    const bucketName = 'video-bucket';
    const posterBucket = 'poster-bucket';

    return await this.videoService.uploadFile(createAudioDto, bucketName, posterBucket, audioFile, posterFile);
  }

  @Get()
  findAllVideos(@Pagination() pagination: { page: number; limit: number }) {
    const { page, limit } = pagination;
    return this.videoService.findAllVideos(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    return this.videoService.update(+id, updateVideoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videoService.remove(+id);
  }
}
