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
import { audioUploadMulterOptions } from '@/shared/upload/multer-limits';

import { AudioService } from './audio.service';
import { CreateAudioDto } from './dto/create-audio.dto';
import { UpdateAudioDto } from './dto/update-audio.dto';

@Controller('audio')
export class AudioController {
  constructor(
    private readonly audioService: AudioService,
    private readonly mediaViewService: MediaViewService,
  ) {}

  @Post('upload')
  @CheckAbility({ action: 'create', subject: 'Audio' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'poster', maxCount: 1 },
      ],
      audioUploadMulterOptions,
    ),
  )
  async upload(
    @Body() dto: CreateAudioDto,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      poster?: Express.Multer.File[];
    },
  ) {
    const audioFile = files.file?.[0];
    const posterFile = files.poster?.[0];

    if (!audioFile || !posterFile) {
      throw new BadRequestException(BadRequestMessage.BothFilesRequired);
    }

    const result = await this.audioService.upload(dto, audioFile, posterFile);

    return {
      message: result.message,
      data: null,
    };
  }

  @Public()
  @Get()
  async findAll(@Query() query: PaginationDto) {
    const data = await this.audioService.findAll(query.page, query.limit);

    return {
      message: 'لیست فایل‌های صوتی دریافت شد',
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
    const data = await this.audioService.findSuggestions(id, limit);

    return {
      message: 'پیشنهادهای صوت دریافت شد',
      data,
    };
  }

  @Public()
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const data = await this.audioService.findById(id);

    return {
      message: 'فایل صوتی دریافت شد',
      data,
    };
  }

  @Public()
  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  async like(@Param('id', ParseIntPipe) id: number, @Req() request: Request) {
    const visitorKey = this.mediaViewService.buildVisitorKey(request);
    const data = await this.audioService.like(id, visitorKey);

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
    const data = await this.audioService.view(id, visitorKey);

    return {
      message: data.message,
      data: { views: data.views, counted: data.counted },
    };
  }

  @Patch(':id')
  @CheckAbility({ action: 'update', subject: 'Audio' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'poster', maxCount: 1 },
      ],
      audioUploadMulterOptions,
    ),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAudioDto,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      poster?: Express.Multer.File[];
    },
  ) {
    const result = await this.audioService.update(
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

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @CheckAbility({ action: 'delete', subject: 'Audio' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.audioService.remove(id);

    return {
      message: result.message,
      data: null,
    };
  }
}
