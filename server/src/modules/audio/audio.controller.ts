import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AudioService } from './audio.service';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAudioDto } from './dto/create-audio.dto';
import { UpdateAudioDto } from './dto/update-audio.dto';

@Controller('audio')
@ApiTags('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload audio file and poster with categories' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload audio with title, poster, and categories',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Sample Audio Title' },
        text: { type: 'string', example: 'Optional description of the audio' },
        categories: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of category IDs',
          example: [1, 2, 3],
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Audio file to be uploaded',
        },
        poster: {
          type: 'string',
          format: 'binary',
          description: 'Poster image for the audio',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Audio and poster uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'poster', maxCount: 1 },
    ]),
  )
  async uploadFile(
    @Body() createAudioDto: CreateAudioDto,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      poster?: Express.Multer.File[];
    },
  ) {
    const audioFile = files.file?.[0];
    const posterFile = files.poster?.[0];

    if (!audioFile || !posterFile) {
      throw new HttpException('Both audio file and poster are required.', HttpStatus.BAD_REQUEST);
    }

    const bucketName = 'audio-bucket';
    const posterBucket = 'poster-bucket';

    return await this.audioService.uploadFile(createAudioDto, bucketName, posterBucket, audioFile, posterFile);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audio by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Audio ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Audio retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Audio not found.' })
  async audioById(@Param('id') id: number) {
    return await this.audioService.audioById(id);
  }

  @Get()
  @ApiOperation({ summary: 'List all audio files' })
  async findAll() {
    return await this.audioService.findAllAudios();
  }

  @Patch('like/:id')
  @ApiOperation({ summary: 'Like an audio by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Audio ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Audio liked successfully.' })
  @ApiResponse({ status: 404, description: 'Audio not found.' })
  async likeAudio(@Param('id') id: number) {
    return await this.audioService.likeAudio(id);
  }

  @Get('files/:bucketName')
  @ApiOperation({ summary: 'List all audio files in a bucket' })
  @ApiParam({
    name: 'bucketName',
    type: 'string',
    description: 'Name of the bucket containing audio files',
    example: 'audio-bucket',
  })
  @ApiResponse({ status: 200, description: 'Audio files retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Bucket not found.' })
  async getFiles(@Param('bucketName') bucketName: string) {
    return await this.audioService.audiosList(bucketName);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an audio file by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Audio ID', example: 1 })
  @ApiResponse({ status: 200, description: 'Audio deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Audio not found.' })
  async deleteAudio(@Param('id') id: number) {
    const bucketName = 'audio-bucket';
    const posterBucket = 'poster-bucket';
    return await this.audioService.deleteAudio(id, bucketName, posterBucket);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update audio file, poster, or categories' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Update audio with optional title, poster, categories, or audio file',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Updated Audio Title' },
        text: { type: 'string', example: 'Updated description of the audio' },
        categories: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of category IDs (optional)',
          example: [2, 3],
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Optional updated audio file',
        },
        poster: {
          type: 'string',
          format: 'binary',
          description: 'Optional updated poster image',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Audio updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'file', maxCount: 1 },
      { name: 'poster', maxCount: 1 },
    ]),
  )
  async updateFile(
    @Param('id') id: number,
    @Body() updateAudioDto: Partial<CreateAudioDto>,
    @UploadedFiles()
    files: {
      file?: Express.Multer.File[];
      poster?: Express.Multer.File[];
    },
  ) {
    console.log(updateAudioDto);
    
    const audioFile = files.file?.[0];
    const posterFile = files.poster?.[0];

    const bucketName = 'audio-bucket';
    const posterBucket = 'poster-bucket';

    return await this.audioService.updateAudio(id, updateAudioDto, bucketName, posterBucket, audioFile, posterFile);
  }
}
