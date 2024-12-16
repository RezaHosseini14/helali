import { Controller, Get, Post, Body, Patch, Param, UseInterceptors, UploadedFile, Delete } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('gallery')
@ApiTags('Gallery') // Swagger category name
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload an image to the gallery' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload an image with an optional description',
    schema: {
      type: 'object',
      properties: {
        desc: { type: 'string', example: 'This is a test image' },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Body() createGalleryDto: CreateGalleryDto, @UploadedFile() file: Express.Multer.File) {
    const bucketName = 'gallery-bucket';
    return await this.galleryService.uploadImage(createGalleryDto, bucketName, file);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve a list of images in the gallery' })
  @ApiResponse({
    status: 200,
    description: 'Image list retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          path: { type: 'string', example: 'http://example.com/image.jpg' },
          desc: { type: 'string', example: 'A beautiful image' },
          like: { type: 'number', example: 42 },
        },
      },
    },
  })
  findAll() {
    return this.galleryService.findAllImages();
  }

  @Patch('like/:id')
  @ApiOperation({ summary: 'Like an image' })
  @ApiParam({
    name: 'id',
    description: 'Image ID',
    required: true,
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Image liked successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Like registered successfully' },
        statusCode: { type: 'number', example: 200 },
        likes: { type: 'number', example: 43 },
      },
    },
  })
  async likeImage(@Param('id') id: number) {
    return await this.galleryService.likeImage(id);
  }

  @Delete(':id')
  async deleteImage(@Param('id') id: number) {
    const bucketName = 'gallery-bucket';
    return await this.galleryService.deleteImage(id, bucketName);
  }
}
