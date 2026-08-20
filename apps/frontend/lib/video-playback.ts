export interface IVideoPlaybackSource {
  readonly src: string;
  readonly mimeType?: string;
}

interface IVideoPlaybackInput {
  readonly path: string;
  readonly mimetype?: string;
  readonly hlsUrl?: string | null;
  readonly processingStatus?: 'pending' | 'processing' | 'ready' | 'failed' | null;
}

export function isHlsPlaybackSource(
  src: string,
  mimeType?: string,
): boolean {
  return (
    mimeType === 'application/vnd.apple.mpegurl' ||
    mimeType === 'application/x-mpegURL' ||
    /\.m3u8($|\?)/i.test(src)
  );
}

export function resolveVideoPlaybackSource(
  video: IVideoPlaybackInput,
): IVideoPlaybackSource {
  if (video.hlsUrl && video.processingStatus === 'ready') {
    return {
      src: video.hlsUrl,
      mimeType: 'application/vnd.apple.mpegurl',
    };
  }

  return {
    src: video.path,
    mimeType: video.mimetype,
  };
}
