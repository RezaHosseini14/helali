import { Test, TestingModule } from '@nestjs/testing';

import { CategoriesRepository } from '@/features/categories/categories.repository';
import { ApiCacheService } from '@/shared/cache/api-cache.service';
import { MediaViewService } from '@/shared/media-view/media-view.service';
import { StorageService } from '@/shared/storage/storage.service';

import { VideoRepository } from './video.repository';
import { VideoService } from './video.service';

describe('VideoService', () => {
  let service: VideoService;
  let videoRepository: jest.Mocked<Pick<VideoRepository, 'findMany' | 'findStories'>>;

  beforeEach(async () => {
    videoRepository = {
      findMany: jest.fn(),
      findStories: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoService,
        { provide: VideoRepository, useValue: videoRepository },
        { provide: CategoriesRepository, useValue: {} },
        {
          provide: StorageService,
          useValue: {
            getPresignedUrl: jest.fn().mockResolvedValue('https://example.com/file'),
          },
        },
        {
          provide: MediaViewService,
          useValue: {
            tryClaimView: jest.fn().mockResolvedValue(true),
            buildVisitorKey: jest.fn().mockReturnValue('visitor'),
          },
        },
        {
          provide: ApiCacheService,
          useValue: {
            getVersion: jest.fn().mockResolvedValue(1),
            bumpVersion: jest.fn().mockResolvedValue(undefined),
            getOrSet: jest.fn(async (_key: string, _ttl: number, factory: () => Promise<unknown>) =>
              factory(),
            ),
          },
        },
      ],
    }).compile();

    service = module.get(VideoService);
  });

  it('returns empty list envelope when no videos exist', async () => {
    videoRepository.findMany.mockResolvedValue({ items: [], total: 0 });

    await expect(service.findAll(1, 12)).resolves.toEqual({
      videos: [],
      total: 0,
      page: 1,
      lastPage: 0,
    });
  });

  it('returns empty stories envelope when no stories exist', async () => {
    videoRepository.findStories.mockResolvedValue([]);

    await expect(service.findStories()).resolves.toEqual({ stories: [] });
  });
});
