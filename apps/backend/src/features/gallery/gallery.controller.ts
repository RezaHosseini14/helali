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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CheckAbility } from '@/shared/decorators/check-ability.decorator';
import { Public } from '@/shared/decorators/public.decorator';
import { BadRequestMessage } from '@/shared/constants/messages';
import { PaginationDto } from '@/shared/dto/pagination.dto';
import { galleryUploadMulterOptions } from '@/shared/upload/multer-limits';

import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryFeaturedDto } from './dto/update-gallery-featured.dto';
import { GalleryService } from './gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post('upload')
  @CheckAbility({ action: 'create', subject: 'Gallery' })
  @UseInterceptors(FileInterceptor('file', galleryUploadMulterOptions))
  async upload(
    @Body() dto: CreateGalleryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(BadRequestMessage.ImageRequired);
    }

    const result = await this.galleryService.upload(dto, file);

    return {
      message: result.message,
      data: null,
    };
  }

  @Public()
  @Get('featured')
  async findFeatured() {
    const data = await this.galleryService.findFeatured();

    return {
      message: 'تصاویر منتخب دریافت شد',
      data,
    };
  }

  @Public()
  @Get()
  async findAll(@Query() query: PaginationDto) {
    const data = await this.galleryService.findAll(query.page, query.limit);

    return {
      message: 'تصاویر دریافت شد',
      data,
    };
  }

  @Patch(':id/featured')
  @HttpCode(HttpStatus.OK)
  @CheckAbility({ action: 'update', subject: 'Gallery' })
  async setFeatured(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateGalleryFeaturedDto,
  ) {
    const data = await this.galleryService.setFeatured(id, dto.isFeatured);

    return {
      message: data.message,
      data: { image: data.image },
    };
  }

  @Public()
  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  async like(@Param('id', ParseIntPipe) id: number) {
    const data = await this.galleryService.like(id);

    return {
      message: data.message,
      data: { likes: data.likes },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @CheckAbility({ action: 'delete', subject: 'Gallery' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.galleryService.remove(id);

    return {
      message: result.message,
      data: null,
    };
  }
}
