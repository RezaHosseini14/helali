import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Pagination } from 'src/common/decorator/pagination.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseGuards(AuthGuard)
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
    const videoFile = files.file?.[0];
    const posterFile = files.poster?.[0];

    const bucketName = 'video-bucket';
    const posterBucket = 'poster-bucket';

    return await this.videoService.uploadFile(createAudioDto, bucketName, posterBucket, videoFile, posterFile);
  }

  @Get('findAllStories')
  findAllStories() {
    return this.videoService.findAllStories();
  }

  @Get()
  findAllVideos(@Pagination() pagination: { page: number; limit: number }) {
    const { page, limit } = pagination;
    return this.videoService.findAllVideos(page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.videoService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    return this.videoService.update(+id, updateVideoDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    const bucketName = 'video-bucket';
    const posterBucket = 'poster-bucket';
    return this.videoService.remove(+id, bucketName, posterBucket);
  }
}
