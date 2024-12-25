import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AudioCommentsEntity } from './entities/audioComment.entity';
import { Repository } from 'typeorm';
import { AudioEntity } from '../audio/entities/audio.entity';
import { GalleryEntity } from '../gallery/entities/gallery.entity';
import { GalleryCommentsEntity } from './entities/galleryComments.entity';

@Injectable()
export class CommentsService {
  private forbiddenWords: string[] = [
    'کس',
    'کس کش',
    'کونی',
    'جاکش',
    'حرومزاده',
    'بی ناموس',
    'بیناموس',
    'جنده',
    'مادر جنده',
    'مادر قحبه',
    'بی پدر',
    'کس پدر',
    'زنازاده',
    'حرومی',
  ];
  constructor(
    @InjectRepository(AudioCommentsEntity)
    private audioCommentsRepository: Repository<AudioCommentsEntity>,
    @InjectRepository(AudioEntity)
    private audioRepository: Repository<AudioEntity>,
    @InjectRepository(GalleryCommentsEntity)
    private galleryCommentsRepository: Repository<GalleryCommentsEntity>,
    @InjectRepository(GalleryEntity)
    private galleryRepository: Repository<GalleryEntity>,
  ) {}
  private containsForbiddenWords(text: string): boolean {
    return this.forbiddenWords.some((word) => text.includes(word));
  }

  async createAudioComment(createCommentDto: CreateCommentDto, audioId: number) {
    const audio = await this.audioRepository.findOne({
      where: { id: audioId },
    });

    if (!audio) {
      throw new HttpException('فایل موردنظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    if (this.containsForbiddenWords(createCommentDto.text)) {
      throw new HttpException('کامنت شامل کلمات ناپسند است', HttpStatus.BAD_REQUEST);
    }
    const newComment = this.audioCommentsRepository.create({
      author: createCommentDto.author,
      text: createCommentDto.text,
      audio: audio,
    });

    const saveComment = await this.audioCommentsRepository.save(newComment);
    if (saveComment) {
      return {
        message: 'نظر شما ثبت شد',
        statusCode: HttpStatus.CREATED,
      };
    }
  }

  async createGalleryComment(createCommentDto: CreateCommentDto, galleryId: number) {
    const gallery = await this.galleryRepository.findOne({
      where: { id: galleryId },
    });

    if (!gallery) {
      throw new HttpException('تصویر موردنظر یافت نشد', HttpStatus.NOT_FOUND);
    }

    if (this.containsForbiddenWords(createCommentDto.text)) {
      throw new HttpException('کامنت شامل کلمات ناپسند است', HttpStatus.BAD_REQUEST);
    }

    const newComment = this.galleryCommentsRepository.create({
      author: createCommentDto.author,
      text: createCommentDto.text,
      gallery: gallery,
    });

    const saveComment = await this.galleryCommentsRepository.save(newComment);
    if (saveComment) {
      return {
        message: 'نظر شما ثبت شد',
        statusCode: HttpStatus.CREATED,
      };
    }
  }

  async allAudiosCommentsById(audioId: number) {
    try {
      const comments = await this.audioCommentsRepository.find({
        where: {
          audio: { id: audioId },
          status: 'published',
        },
        order: { id: 'DESC' },
      });
      return {
        message: 'لیست نظرات دریافت شد',
        statusCode: HttpStatus.OK,
        comments,
      };
    } catch (error) {
      throw new HttpException('خطایی رخ داد', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async allAudiosComments() {
    try {
      const comments = await this.audioCommentsRepository.find({
        order: { id: 'DESC' },
      });
      return {
        message: 'لیست نظرات دریافت شد',
        statusCode: HttpStatus.OK,
        comments,
      };
    } catch (error) {
      throw new HttpException('خطایی رخ داد', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateCommentStatus(commentId: number, newStatus: string, commentType: 'audio' | 'gallery') {
    let comment;

    if (commentType === 'audio') {
      comment = await this.audioCommentsRepository.findOne({ where: { id: commentId } });
      if (!comment) {
        throw new HttpException('کامنت صوتی یافت نشد', HttpStatus.NOT_FOUND);
      }
    } else if (commentType === 'gallery') {
      comment = await this.galleryCommentsRepository.findOne({ where: { id: commentId } });
      if (!comment) {
        throw new HttpException('کامنت گالری یافت نشد', HttpStatus.NOT_FOUND);
      }
    } else {
      throw new HttpException('نوع کامنت معتبر نیست', HttpStatus.BAD_REQUEST);
    }

    comment.status = newStatus;

    await this.audioCommentsRepository.save(comment);

    return {
      message: `وضعیت کامنت به ${newStatus} تغییر یافت`,
      statusCode: HttpStatus.OK,
    };
  }
}
