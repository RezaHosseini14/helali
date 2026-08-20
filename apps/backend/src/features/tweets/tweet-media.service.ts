import { Injectable, Logger } from '@nestjs/common';

import { MINIO_BUCKETS } from '@helali/shared';

import { StorageService } from '@/shared/storage/storage.service';

import type { ITweetDraft } from './tweets.types';

interface IFxMediaItem {
  readonly type?: string;
  readonly url?: string;
  readonly thumbnail_url?: string;
}

interface IFxTweetPayload {
  readonly likes?: number;
  readonly replies?: number;
  readonly retweets?: number;
  readonly quotes?: number;
  readonly media?: {
    readonly all?: readonly IFxMediaItem[];
  };
}

interface IFxTweetResponse {
  readonly tweet?: IFxTweetPayload | null;
}

interface IVxMediaItem {
  readonly type?: string;
  readonly url?: string;
  readonly thumbnail_url?: string;
}

interface IVxTweetResponse {
  readonly mediaURLs?: readonly string[];
  readonly media_extended?: readonly IVxMediaItem[];
  readonly likes?: number;
  readonly replies?: number;
  readonly retweets?: number;
  readonly quotes?: number;
  readonly quote_count?: number;
  readonly quoteCount?: number;
}

interface IRemoteTweetData {
  readonly imageUrls: string[];
  readonly videoUrls: string[];
  readonly videoPosterUrls: string[];
  readonly hasVideo: boolean;
  readonly likeCount: number;
  readonly replyCount: number;
  readonly retweetCount: number;
  readonly quoteCount: number;
}

const FETCH_TIMEOUT_MS = 20_000;
const EMPTY_REMOTE: IRemoteTweetData = {
  imageUrls: [],
  videoUrls: [],
  videoPosterUrls: [],
  hasVideo: false,
  likeCount: 0,
  replyCount: 0,
  retweetCount: 0,
  quoteCount: 0,
};

@Injectable()
export class TweetMediaService {
  private readonly logger = new Logger(TweetMediaService.name);

  constructor(private readonly storageService: StorageService) {}

  async enrichAndMirror(drafts: readonly ITweetDraft[]): Promise<ITweetDraft[]> {
    const enriched: ITweetDraft[] = [];

    for (const draft of drafts) {
      try {
        enriched.push(await this.enrichOne(draft));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Media enrich failed for ${draft.externalId}: ${message}`);
        enriched.push(draft);
      }
    }

    return enriched;
  }

  async fetchEngagement(externalId: string): Promise<{
    likeCount: number;
    replyCount: number;
    retweetCount: number;
    quoteCount: number;
  }> {
    const remote = await this.fetchRemoteMedia(externalId);
    return {
      likeCount: remote.likeCount,
      replyCount: remote.replyCount,
      retweetCount: remote.retweetCount,
      quoteCount: remote.quoteCount,
    };
  }

  async mirrorAvatar(username: string, avatarUrl: string): Promise<string> {
    const normalizedUsername = username.trim().replace(/^@/, '').toLowerCase();
    if (!avatarUrl.trim()) {
      return avatarUrl;
    }

    if (avatarUrl.includes('/files/tweets-bucket/') || avatarUrl.includes('/tweets-bucket/')) {
      return avatarUrl;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(avatarUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'image/*,*/*',
          'Accept-Encoding': 'identity',
          Referer: 'https://x.com/',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') ?? this.guessMime(avatarUrl, 'image');
      const extension = this.extensionFor(contentType, avatarUrl, 'image');
      const objectName = `profiles/${normalizedUsername}/avatar.${extension}`;

      await this.storageService.putObject(MINIO_BUCKETS.TWEETS, {
        buffer,
        size: buffer.length,
        mimetype: contentType.split(';')[0]?.trim() || contentType,
        objectName,
      });

      return this.storageService.getPublicObjectUrl(MINIO_BUCKETS.TWEETS, objectName);
    } finally {
      clearTimeout(timeout);
    }
  }

  private async enrichOne(draft: ITweetDraft): Promise<ITweetDraft> {
    const remote = await this.fetchRemoteMedia(draft.externalId);

    const imageUrls = remote.imageUrls.length > 0 ? remote.imageUrls : [...draft.imageUrls];
    const videoUrls = remote.videoUrls.length > 0 ? remote.videoUrls : [...draft.videoUrls];
    const videoPosterUrls =
      remote.videoPosterUrls.length > 0 ? remote.videoPosterUrls : [...draft.videoPosterUrls];
    const hasVideo = remote.hasVideo || draft.hasVideo || videoUrls.length > 0;
    const shouldMirrorMedia =
      draft.hasVideo || draft.imageUrls.length > 0 || draft.videoPosterUrls.length > 0 || hasVideo;

    const mirroredImages = shouldMirrorMedia
      ? await this.mirrorMany(draft.externalId, 'image', imageUrls)
      : imageUrls;
    const mirroredVideos = shouldMirrorMedia
      ? await this.mirrorMany(draft.externalId, 'video', videoUrls)
      : videoUrls;
    const mirroredPosters = shouldMirrorMedia
      ? await this.mirrorMany(draft.externalId, 'poster', videoPosterUrls)
      : videoPosterUrls;

    return {
      ...draft,
      imageUrls: mirroredImages,
      videoUrls: mirroredVideos,
      videoPosterUrls: mirroredPosters,
      hasVideo: hasVideo || mirroredVideos.length > 0,
      likeCount: remote.likeCount,
      replyCount: remote.replyCount,
      retweetCount: remote.retweetCount,
      quoteCount: remote.quoteCount,
    };
  }

  private async fetchRemoteMedia(externalId: string): Promise<IRemoteTweetData> {
    const errors: string[] = [];

    try {
      return await this.fetchFromFxTwitter(externalId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`fxtwitter: ${message}`);
    }

    try {
      return await this.fetchFromVxTwitter(externalId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`vxtwitter: ${message}`);
    }

    this.logger.warn(`Remote tweet fetch failed for ${externalId}: ${errors.join(' | ')}`);
    return EMPTY_REMOTE;
  }

  private async fetchFromFxTwitter(externalId: string): Promise<IRemoteTweetData> {
    const payload = await this.fetchJson<IFxTweetResponse>(
      `https://api.fxtwitter.com/status/${externalId}`,
    );
    const tweet = payload.tweet;
    if (!tweet) {
      throw new Error('empty tweet');
    }

    const imageUrls: string[] = [];
    const videoUrls: string[] = [];
    const videoPosterUrls: string[] = [];

    for (const item of tweet.media?.all ?? []) {
      const type = (item.type ?? '').toLowerCase();
      const url = item.url?.trim();
      const thumb = item.thumbnail_url?.trim();

      if (!url) {
        continue;
      }

      if (type === 'video' || type === 'gif') {
        videoUrls.push(url);
        if (thumb) {
          videoPosterUrls.push(thumb);
        }
      } else {
        imageUrls.push(url);
      }
    }

    return {
      imageUrls: [...new Set(imageUrls)],
      videoUrls: [...new Set(videoUrls)],
      videoPosterUrls: [...new Set(videoPosterUrls)],
      hasVideo: videoUrls.length > 0,
      likeCount: this.toCount(tweet.likes),
      replyCount: this.toCount(tweet.replies),
      retweetCount: this.toCount(tweet.retweets),
      quoteCount: this.toCount(tweet.quotes),
    };
  }

  private async fetchFromVxTwitter(externalId: string): Promise<IRemoteTweetData> {
    const payload = await this.fetchJson<IVxTweetResponse>(
      `https://api.vxtwitter.com/Twitter/status/${externalId}`,
    );
    const imageUrls: string[] = [];
    const videoUrls: string[] = [];
    const videoPosterUrls: string[] = [];

    for (const item of payload.media_extended ?? []) {
      const type = (item.type ?? '').toLowerCase();
      const url = item.url?.trim();
      const thumb = item.thumbnail_url?.trim();

      if (type === 'video' || type === 'gif') {
        if (url) {
          videoUrls.push(url);
        }
        if (thumb) {
          videoPosterUrls.push(thumb);
        }
      } else if (url) {
        imageUrls.push(url);
      }
    }

    if (imageUrls.length === 0 && videoUrls.length === 0) {
      for (const url of payload.mediaURLs ?? []) {
        if (/\.mp4(\?|$)/i.test(url) || /video\.twimg\.com/i.test(url)) {
          videoUrls.push(url);
        } else {
          imageUrls.push(url);
        }
      }
    }

    return {
      imageUrls: [...new Set(imageUrls)],
      videoUrls: [...new Set(videoUrls)],
      videoPosterUrls: [...new Set(videoPosterUrls)],
      hasVideo: videoUrls.length > 0,
      likeCount: this.toCount(payload.likes),
      replyCount: this.toCount(payload.replies),
      retweetCount: this.toCount(payload.retweets),
      quoteCount: this.toCount(payload.quotes ?? payload.quote_count ?? payload.quoteCount),
    };
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'identity',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  private toCount(value: number | undefined): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      return 0;
    }
    return Math.floor(value);
  }

  private async mirrorMany(
    externalId: string,
    kind: 'image' | 'video' | 'poster',
    urls: readonly string[],
  ): Promise<string[]> {
    const mirrored: string[] = [];

    for (const [index, url] of urls.entries()) {
      try {
        mirrored.push(await this.mirrorOne(externalId, kind, index, url));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Mirror failed for ${url}: ${message}`);
        mirrored.push(url);
      }
    }

    return mirrored;
  }

  private async mirrorOne(
    externalId: string,
    kind: 'image' | 'video' | 'poster',
    index: number,
    url: string,
  ): Promise<string> {
    if (url.includes('/files/tweets-bucket/') || url.includes('/tweets-bucket/')) {
      return url;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: '*/*',
          'Accept-Encoding': 'identity',
          Referer: 'https://x.com/',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') ?? this.guessMime(url, kind);
      const extension = this.extensionFor(contentType, url, kind);
      const objectName = `${externalId}/${kind}-${index}.${extension}`;

      await this.storageService.putObject(MINIO_BUCKETS.TWEETS, {
        buffer,
        size: buffer.length,
        mimetype: contentType.split(';')[0]?.trim() || contentType,
        objectName,
      });

      return this.storageService.getPublicObjectUrl(MINIO_BUCKETS.TWEETS, objectName);
    } finally {
      clearTimeout(timeout);
    }
  }

  private guessMime(url: string, kind: 'image' | 'video' | 'poster'): string {
    if (kind === 'video' || /\.mp4(\?|$)/i.test(url)) {
      return 'video/mp4';
    }
    if (/\.png(\?|$)/i.test(url)) {
      return 'image/png';
    }
    if (/\.webp(\?|$)/i.test(url)) {
      return 'image/webp';
    }
    return 'image/jpeg';
  }

  private extensionFor(
    contentType: string,
    url: string,
    kind: 'image' | 'video' | 'poster',
  ): string {
    const mime = contentType.split(';')[0]?.trim().toLowerCase() ?? '';
    if (mime.includes('mp4') || kind === 'video') {
      return 'mp4';
    }
    if (mime.includes('png') || /\.png(\?|$)/i.test(url)) {
      return 'png';
    }
    if (mime.includes('webp') || /\.webp(\?|$)/i.test(url)) {
      return 'webp';
    }
    return 'jpg';
  }
}
