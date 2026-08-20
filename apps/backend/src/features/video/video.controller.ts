import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';

import { CheckAbility } from '@/shared/decorators/check-ability.decorator';
import { Public } from '@/shared/decorators/public.decorator';
import { BadRequestMessage } from '@/shared/constants/messages';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { MediaViewService } from '@/shared/media-view/media-view.service';
import { videoUploadMulterOptions } from '@/shared/upload/multer-limits';

import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoService } from './video.service';

@Controller('video')
export class VideoController {
  constructor(
    private readonly videoService: VideoService,
    private readonly mediaViewService: MediaViewService,
  ) {}

  @Post('upload')
  @CheckAbility({ action: 'create', subject: 'Video' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'poster', maxCount: 1 },
      ],
      videoUploadMulterOptions,
    ),
  )
  async upload(
    @Body() dto: CreateVideoDto,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      poster?: Express.Multer.File[];
    },
  ) {
    const videoFile = files.file?.[0];
    const posterFile = files.poster?.[0];

    if (!videoFile || !posterFile) {
      throw new BadRequestException(BadRequestMessage.BothFilesRequired);
    }

    const result = await this.videoService.upload(dto, videoFile, posterFile);

    return {
      message: result.message,
      data: null,
    };
  }

  @Public()
  @Get('stories')
  async findStories() {
    const data = await this.videoService.findStories();

    return {
      message: 'استوری‌ها دریافت شد',
      data,
    };
  }

  @Public()
  @Get()
  async findAll(@Query() query: PaginationDto) {
    const data = await this.videoService.findAll(query.page, query.limit);

    return {
      message: 'لیست ویدیوها دریافت شد',
      data,
    };
  }

  @Public()
  @Get(':id/suggestions')
  async findSuggestions(
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limitRaw?: string,
  ) {
    const limit = Math.min(Math.max(Number(limitRaw) || 5, 1), 20);
    const data = await this.videoService.findSuggestions(id, limit);

    return {
      message: 'پیشنهادهای ویدیو دریافت شد',
      data,
    };
  }

  @Public()
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.videoService.findById(id);

    return {
      message: 'ویدیو دریافت شد',
      data,
    };
  }

  @Public()
  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  async like(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    const visitorKey = this.mediaViewService.buildVisitorKey(request);
    const data = await this.videoService.like(id, visitorKey);

    return {
      message: data.message,
      data: { likes: data.likes, counted: data.counted },
    };
  }

  @Public()
  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  async view(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    const visitorKey = this.mediaViewService.buildVisitorKey(request);
    const data = await this.videoService.view(id, visitorKey);

    return {
      message: data.message,
      data: { views: data.views, counted: data.counted },
    };
  }

  @Patch(':id')
  @CheckAbility({ action: 'update', subject: 'Video' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'poster', maxCount: 1 },
      ],
      videoUploadMulterOptions,
    ),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateVideoDto,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      poster?: Express.Multer.File[];
    },
  ) {
    const result = await this.videoService.update(
      id,
      dto,
      files.file?.[0],
      files.poster?.[0],
    );

    return {
      message: result.message,
      data: null,
    };
  }

  @Post(':id/reprocess')
  @HttpCode(HttpStatus.OK)
  @CheckAbility({ action: 'update', subject: 'Video' })
  async reprocess(@Param('id', ParseIntPipe) id: number) {
    const result = await this.videoService.reprocess(id);

    return {
      message: result.message,
      data: null,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @CheckAbility({ action: 'delete', subject: 'Video' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.videoService.remove(id);

    return {
      message: result.message,
      data: null,
    };
  }
}
