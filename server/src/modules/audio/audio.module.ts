import { Module } from '@nestjs/common';
import { AudioService } from './audio.service';
import { AudioController } from './audio.controller';
import { Audio, audioSchema } from 'src/schemas/Audio.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { MinioModule } from '../minio/minio.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Audio.name, schema: audioSchema }]),
    MinioModule,
  ],
  controllers: [AudioController],
  providers: [AudioService],
})
export class AudioModule {}
