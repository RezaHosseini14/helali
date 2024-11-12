import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AudioService } from './audio.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateAudioDto } from './dto/create-audio.dto';

@Controller('audio')
@ApiTags('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body() createAudioDto: CreateAudioDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const bucketName = 'audio-bucket';
    return await this.audioService.uploadFile(
      createAudioDto.title,
      bucketName,
      file,
    );
  }

  @Get('files/:bucketName')
  async getFiles(@Param('bucketName') bucketName: string) {
    console.log(bucketName);

    return await this.audioService.audiosList(bucketName);
  }
}
