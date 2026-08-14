import { audioKeys } from '@/features/audio/hooks/audio-keys';
import { galleryKeys } from '@/features/gallery/hooks/gallery-keys';
import { videoKeys } from '@/features/video/hooks/video-keys';

describe('feature query keys', () => {
  it('builds stable audio list keys', () => {
    expect(audioKeys.list(1, 16)).toEqual(['audio', 'list', 1, 16]);
  });

  it('builds stable video list and stories keys', () => {
    expect(videoKeys.list(2, 12)).toEqual(['video', 'list', 2, 12]);
    expect(videoKeys.stories()).toEqual(['video', 'stories']);
  });

  it('builds stable gallery list keys', () => {
    expect(galleryKeys.list(1, 48)).toEqual(['gallery', 'list', 1, 48]);
  });
});
