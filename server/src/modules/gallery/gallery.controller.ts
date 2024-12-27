import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Pagination } from 'src/common/decorator/pagination.decorator';

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
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 30 * 1024 * 1024 },
      fileFilter(req, file, callback) {
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(new BadRequestException('فرمت فایل مجاز نیست'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadFile(@Body() createGalleryDto: CreateGalleryDto, @UploadedFile() file: Express.Multer.File) {
    const bucketName = 'gallery-bucket';
    return await this.galleryService.uploadImage(createGalleryDto, bucketName, file);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve a paginated list of images in the gallery' })
  @ApiResponse({
    status: 200,
    description: 'Paginated image list retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        images: {
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
        total: { type: 'number', example: 100 },
        currentPage: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 10 },
      },
    },
  })
  async findAll(@Pagination() pagination: { limit: number; page: number }) {
    const { limit, page } = pagination;
    return await this.galleryService.findAllImages(limit, page);
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
