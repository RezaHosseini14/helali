import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

@Controller('gallery')
@ApiTags('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const bucketName = 'gallery-bucket';
    return await this.galleryService.uploadImage(bucketName, file);
  }

  // @Post()
  // create(@Body() createGalleryDto: CreateGalleryDto) {
  //   return this.galleryService.create(createGalleryDto);
  // }

  // @Get()
  // findAll() {
  //   return this.galleryService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.galleryService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateGalleryDto: UpdateGalleryDto) {
  //   return this.galleryService.update(+id, updateGalleryDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.galleryService.remove(+id);
  // }
}
