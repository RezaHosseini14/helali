import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('audio')
  async allAudioComments(@Param('audioId') audioId: number) {
    return await this.commentsService.allAudioComments(audioId);
  }
  @Post('audio/:audioId')
  async createAudioComment(@Body() createCommentDto: CreateCommentDto, @Param('audioId') audioId: number) {
    return await this.commentsService.createAudioComment(createCommentDto, audioId);
  }
  @Post('gallery/:audioId')
  async createGalleryComment(@Body() createCommentDto: CreateCommentDto, @Param('galleryId') galleryId: number) {
    return await this.commentsService.createGalleryComment(createCommentDto, galleryId);
  }
}
