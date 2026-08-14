import { Injectable } from '@nestjs/common';

import { UsersRepository } from '@/features/users/users.repository';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class DashboardRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async getOverviewCounts() {
    const [users, audios, videos, galleries, audioComments, galleryComments, videoComments] =
      await Promise.all([
        this.usersRepository.countAll(),
        this.usersRepository.countAudios(),
        this.usersRepository.countVideos(),
        this.usersRepository.countGalleries(),
        this.prisma.audioComment.count(),
        this.prisma.galleryComment.count(),
        this.prisma.videoComment.count(),
      ]);

    return {
      users,
      audios,
      videos,
      galleries,
      comments: audioComments + galleryComments + videoComments,
    };
  }
}
