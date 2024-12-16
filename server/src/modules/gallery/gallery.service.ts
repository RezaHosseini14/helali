import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MinioService } from '../minio/minio.service';
import { InjectRepository } from '@nestjs/typeorm';
import { GalleryEntity } from './entities/gallery.entity';
import { Repository } from 'typeorm';
import { CreateGalleryDto } from './dto/create-gallery.dto';

@Injectable()
export class GalleryService {
  constructor(
    private readonly minioService: MinioService,
    @InjectRepository(GalleryEntity)
    private galleryRepository: Repository<GalleryEntity>,
  ) {}

  async uploadImage(createGalleryDto: CreateGalleryDto, bucketName: string, file: Express.Multer.File) {
    try {
      const { desc } = createGalleryDto;
      const fileExtension = file.originalname.split('.').pop();
      const timestamp = Date.now();
      const newFileName = `${timestamp}.${fileExtension}`;

      await this.minioService.uploadFile(bucketName, {
        ...file,
        originalname: newFileName,
      });

      const filePath = `http://${process.env.MINIO_URL}:${process.env.MINIO_PORT}/${bucketName}/${newFileName}`;

      const image = this.galleryRepository.create({
        desc,
        path: filePath,
        originalName: newFileName,
        size: file.size.toString(),
        mimetype: file.mimetype,
      });

      const saveAudio = await this.galleryRepository.save(image);
      if (saveAudio) {
        return {
          message: 'فایل آپلود شد',
          statusCode: HttpStatus.CREATED,
        };
      }
    } catch (error) {
      throw error;
    }
  }

  async findAllImages() {
    try {
      const images = await this.galleryRepository.find();
      if (images.length <= 0) {
        throw new HttpException('تصویری یافت نشد', HttpStatus.NOT_FOUND);
      }
      return {
        images,
        statusCode: HttpStatus.CREATED,
      };
    } catch (error) {}
  }

  async likeImage(id: number) {
    try {
      const image = await this.galleryRepository.findOne({
        where: { id },
      });
      if (!image) {
        throw new HttpException('فایل موردنظر یافت نشد', HttpStatus.NOT_FOUND);
      }
      image.like += 1;
      await this.galleryRepository.save(image);
      return {
        message: 'لایک ثبت شد',
        statusCode: HttpStatus.OK,
        likes: image.like,
      };
    } catch (error) {}
  }

  async deleteImage(id: number, bucketName: string) {
    try {
      const image = await this.galleryRepository.findOne({
        where: { id },
      });

      if (!image) {
        throw new HttpException('تصویر موردنظر یافت نشد', HttpStatus.NOT_FOUND);
      }

      const fileName = image.originalName;
      await this.minioService.deleteFile(bucketName, fileName);

      await this.galleryRepository.delete(id);

      return {
        message: 'تصویر حذف شد',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      throw error;
    }
  }
}
