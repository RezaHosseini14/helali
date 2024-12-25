import { Controller, Post, Body, Param, Get, Put } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateStatusDto } from './dto/update-comment-status';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('audio')
  async allAudiosComments() {
    return await this.commentsService.allAudiosComments();
  }
  @Get('audio/:audioId')
  async allAudiosCommentsById(@Param('audioId') audioId: number) {
    return await this.commentsService.allAudiosCommentsById(audioId);
  }
  @Post('audio/:audioId')
  async createAudioComment(@Body() createCommentDto: CreateCommentDto, @Param('audioId') audioId: number) {
    return await this.commentsService.createAudioComment(createCommentDto, audioId);
  }
  @Post('gallery/:audioId')
  async createGalleryComment(@Body() createCommentDto: CreateCommentDto, @Param('galleryId') galleryId: number) {
    return await this.commentsService.createGalleryComment(createCommentDto, galleryId);
  }

  @Put(':commentType/:commentId/status')
  async updateCommentStatus(
    @Param('commentType') commentType: 'audio' | 'gallery',
    @Param('commentId') commentId: number,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    const { newStatus } = updateStatusDto;
    return this.commentsService.updateCommentStatus(commentId, newStatus, commentType);
  }
}
