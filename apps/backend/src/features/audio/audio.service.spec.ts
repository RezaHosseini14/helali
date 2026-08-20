import { Test, TestingModule } from '@nestjs/testing';

import { CategoriesRepository } from '@/features/categories/categories.repository';
import { ApiCacheService } from '@/shared/cache/api-cache.service';
import { MediaDailyStatService } from '@/shared/media-stats/media-daily-stat.service';
import { MediaViewService } from '@/shared/media-view/media-view.service';
import { StorageService } from '@/shared/storage/storage.service';

import { AudioRepository } from './audio.repository';
import { AudioService } from './audio.service';

describe('AudioService', () => {
  let service: AudioService;
  let audioRepository: jest.Mocked<Pick<AudioRepository, 'findMany'>>;

  beforeEach(async () => {
    audioRepository = {
      findMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AudioService,
        { provide: AudioRepository, useValue: audioRepository },
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
            tryClaimLike: jest.fn().mockResolvedValue(true),
            buildVisitorKey: jest.fn().mockReturnValue('visitor'),
          },
        },
        {
          provide: MediaDailyStatService,
          useValue: {
            recordView: jest.fn().mockResolvedValue(undefined),
            recordLike: jest.fn().mockResolvedValue(undefined),
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

    service = module.get(AudioService);
  });

  it('returns empty list envelope when no audios exist', async () => {
    audioRepository.findMany.mockResolvedValue({ items: [], total: 0 });

    await expect(service.findAll(1, 12)).resolves.toEqual({
      audios: [],
      total: 0,
      currentPage: 1,
      totalPages: 0,
    });
  });
});
