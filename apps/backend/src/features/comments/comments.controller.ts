import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import { CheckAbility } from '@/shared/decorators/check-ability.decorator';
import { Public } from '@/shared/decorators/public.decorator';

import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentStatusDto } from './dto/update-comment-status.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Public()
  @Post('audio/:audioId')
  async createAudioComment(
    @Body() dto: CreateCommentDto,
    @Param('audioId', ParseIntPipe) audioId: number,
  ) {
    const result = await this.commentsService.createAudioComment(dto, audioId);

    return {
      message: result.message,
      data: null,
    };
  }

  @Public()
  @Post('gallery/:galleryId')
  async createGalleryComment(
    @Body() dto: CreateCommentDto,
    @Param('galleryId', ParseIntPipe) galleryId: number,
  ) {
    const result = await this.commentsService.createGalleryComment(dto, galleryId);

    return {
      message: result.message,
      data: null,
    };
  }

  @Public()
  @Get('audio/:audioId')
  async findAudioComments(@Param('audioId', ParseIntPipe) audioId: number) {
    const data = await this.commentsService.findPublishedAudioComments(audioId);

    return {
      message: data.message,
      data: { comments: data.comments },
    };
  }

  @Public()
  @Post('video/:videoId')
  async createVideoComment(
    @Body() dto: CreateCommentDto,
    @Param('videoId', ParseIntPipe) videoId: number,
  ) {
    const result = await this.commentsService.createVideoComment(dto, videoId);

    return {
      message: result.message,
      data: null,
    };
  }

  @Public()
  @Get('gallery/:galleryId')
  async findGalleryComments(@Param('galleryId', ParseIntPipe) galleryId: number) {
    const data = await this.commentsService.findPublishedGalleryComments(galleryId);

    return {
      message: data.message,
      data: { comments: data.comments },
    };
  }

  @Public()
  @Get('video/:videoId')
  async findVideoComments(@Param('videoId', ParseIntPipe) videoId: number) {
    const data = await this.commentsService.findPublishedVideoComments(videoId);

    return {
      message: data.message,
      data: { comments: data.comments },
    };
  }

  @Get()
  @CheckAbility({ action: 'manage', subject: 'Comment' })
  async findAll() {
    const data = await this.commentsService.findAll();

    return {
      message: data.message,
      data: {
        comments: data.comments,
        total: data.total,
      },
    };
  }

  @Patch(':type/:id/status')
  @CheckAbility({ action: 'manage', subject: 'Comment' })
  async updateCommentStatus(
    @Param('type') type: 'audio' | 'gallery' | 'video',
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentStatusDto,
  ) {
    const data = await this.commentsService.updateCommentStatus(id, type, dto.newStatus);

    return {
      message: data.message,
      data: data.comment,
    };
  }
}
