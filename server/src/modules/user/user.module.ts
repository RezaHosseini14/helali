import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { AudioEntity } from '../audio/entities/audio.entity';
import { VideoEntity } from '../video/entities/video.entity';
import { GalleryEntity } from '../gallery/entities/gallery.entity';
import { AudioCommentsEntity } from '../comments/entities/audioComment.entity';
import { GalleryCommentsEntity } from '../comments/entities/galleryComments.entity';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({ secret: 'secret', signOptions: { expiresIn: '1d' } }),
    TypeOrmModule.forFeature([
      UserEntity,
      AudioEntity,
      VideoEntity,
      GalleryEntity,
      AudioCommentsEntity,
      GalleryCommentsEntity,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy],
})
export class UserModule {}
