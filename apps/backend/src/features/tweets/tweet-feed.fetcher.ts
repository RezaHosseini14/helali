import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { ITweetDraft } from './tweets.types';

const FXTWITTER_API_BASE = 'https://api.fxtwitter.com';

interface IFxMediaItem {
  readonly type?: string;
  readonly url?: string;
  readonly thumbnail_url?: string;
}

interface IFxStatus {
  readonly type?: string;
  readonly id?: string;
  readonly url?: string;
  readonly text?: string;
  readonly created_at?: string;
  readonly created_timestamp?: number;
  readonly likes?: number;
  readonly replies?: number;
  readonly reposts?: number;
  readonly quotes?: number;
  readonly media?: {
    readonly all?: readonly IFxMediaItem[];
  };
}

interface IFxTimelineResponse {
  readonly code?: number;
  readonly results?: readonly IFxStatus[];
}

interface IFxUserResponse {
  readonly user?: {
    readonly avatar_url?: string;
  } | null;
}

/** RSS-enabled instances first; see https://status.d420.de/ */
const DEFAULT_FEED_INSTANCES = [
  'https://nitter.poast.org',
  'https://nitter.privacyredirect.com',
  'https://nitter.tiekoetter.com',
  'https://nitter.net',
  'https://nitter.catsarch.com',
  'https://xcancel.com',
] as const;

const USERNAME_PATTERN = /^[A-Za-z0-9_]{1,15}$/;
const FETCH_TIMEOUT_MS = 15_000;
const VIDEO_THUMB_PATTERN = /(amplify_video_thumb|ext_tw_video_thumb|tweet_video_thumb)/i;

@Injectable()
export class TweetFeedFetcher {
  private readonly logger = new Logger(TweetFeedFetcher.name);

  constructor(private readonly configService: ConfigService) {}

  async fetchLatest(username: string, limit = 10): Promise<ITweetDraft[]> {
    const normalizedUsername = username.trim().replace(/^@/, '');
    if (!USERNAME_PATTERN.test(normalizedUsername)) {
      throw new BadRequestException('نام کاربری توییت نامعتبر است');
    }

    const errors: string[] = [];

    try {
      const drafts = await this.fetchFromFxTwitter(normalizedUsername, limit);
      if (drafts.length > 0) {
        return drafts;
      }
      errors.push('fxtwitter: empty timeline');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`fxtwitter: ${message}`);
      this.logger.warn(`FxTwitter timeline fetch failed: ${message}`);
    }

    const instances = this.getInstances();

    for (const baseUrl of instances) {
      try {
        const drafts = await this.fetchFromInstance(baseUrl, normalizedUsername, limit);
        if (drafts.length > 0) {
          return drafts;
        }
        errors.push(`${baseUrl}: empty feed`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        errors.push(`${baseUrl}: ${message}`);
        this.logger.warn(`Tweet feed fetch failed for ${baseUrl}: ${message}`);
      }
    }

    throw new ServiceUnavailableException(
      `دریافت توییت‌ها ناموفق بود: ${errors.join(' | ')}`,
    );
  }

  async fetchAvatarUrl(username: string): Promise<string | null> {
    const normalizedUsername = username.trim().replace(/^@/, '');
    if (!USERNAME_PATTERN.test(normalizedUsername)) {
      return null;
    }

    try {
      const avatarUrl = await this.fetchAvatarFromFxTwitter(normalizedUsername);
      if (avatarUrl) {
        return avatarUrl;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`FxTwitter avatar fetch failed: ${message}`);
    }

    const instances = this.getInstances();

    for (const baseUrl of instances) {
      try {
        const avatarUrl = await this.fetchAvatarFromInstance(baseUrl, normalizedUsername);
        if (avatarUrl) {
          return avatarUrl;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Avatar fetch failed for ${baseUrl}: ${message}`);
      }
    }

    return null;
  }

  private async fetchAvatarFromInstance(baseUrl: string, username: string): Promise<string | null> {
    const profileUrl = `${baseUrl.replace(/\/$/, '')}/${username}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(profileUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Encoding': 'identity',
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = Buffer.from(await response.arrayBuffer()).toString('utf8');
      return this.extractAvatarUrl(html, baseUrl);
    } finally {
      clearTimeout(timeout);
    }
  }

  private extractAvatarUrl(html: string, baseUrl: string): string | null {
    const metaPatterns = [
      /property=["']twitter:image:src["'][^>]*content=["']([^"']+)["']/i,
      /content=["']([^"']+)["'][^>]*property=["']twitter:image:src["']/i,
      /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
      /content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
    ];

    for (const pattern of metaPatterns) {
      const match = html.match(pattern)?.[1]?.trim();
      if (match) {
        return this.upgradeAvatarQuality(this.resolveAvatarUrl(match, baseUrl));
      }
    }

    const imgMatch = html.match(
      /profile-card-avatar[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["']/i,
    )?.[1];
    if (imgMatch) {
      return this.upgradeAvatarQuality(this.resolveAvatarUrl(imgMatch.trim(), baseUrl));
    }

    const pathMatch = html.match(/profile_images\/[A-Za-z0-9_./-]+/i)?.[0];
    if (pathMatch) {
      return this.upgradeAvatarQuality(`https://pbs.twimg.com/${pathMatch}`);
    }

    return null;
  }

  private resolveAvatarUrl(raw: string, baseUrl: string): string {
    if (/^https?:\/\/(pbs|video)\.twimg\.com\//i.test(raw)) {
      return raw;
    }

    try {
      const url = new URL(raw, baseUrl);
      const picMatch = url.pathname.match(/\/pic\/(.+)$/i);
      if (picMatch?.[1]) {
        const decoded = decodeURIComponent(picMatch[1]);
        if (/^https?:\/\/(pbs|video)\.twimg\.com\//i.test(decoded)) {
          return decoded;
        }
        return `https://pbs.twimg.com/${decoded.replace(/^\/+/, '')}`;
      }
      return url.toString();
    } catch {
      return raw;
    }
  }

  private upgradeAvatarQuality(url: string): string {
    return url.replace(/_(normal|bigger|mini|x96)(\.[a-z]+)(?:\?.*)?$/i, '_400x400$2');
  }

  private getInstances(): string[] {
    const configured = this.configService.get<string[]>('tweets.feedInstances');
    if (configured && configured.length > 0) {
      return configured;
    }
    return [...DEFAULT_FEED_INSTANCES];
  }

  private async fetchFromFxTwitter(username: string, limit: number): Promise<ITweetDraft[]> {
    const count = Math.min(Math.max(limit, 1), 100);
    const url = `${FXTWITTER_API_BASE}/2/profile/${encodeURIComponent(username)}/statuses?count=${count}`;
    const payload = await this.fetchJson<IFxTimelineResponse>(url);

    const statuses = (payload.results ?? []).filter(
      (item): item is IFxStatus & { id: string } =>
        item.type === 'status' && typeof item.id === 'string' && item.id.length > 0,
    );

    if (statuses.length === 0) {
      throw new Error('empty timeline');
    }

    return statuses.slice(0, limit).map((status) => this.mapFxStatusToDraft(status, username));
  }

  private async fetchAvatarFromFxTwitter(username: string): Promise<string | null> {
    const payload = await this.fetchJson<IFxUserResponse>(
      `${FXTWITTER_API_BASE}/${encodeURIComponent(username)}`,
    );
    const avatarUrl = payload.user?.avatar_url?.trim();
    if (!avatarUrl) {
      return null;
    }
    return this.upgradeAvatarQuality(avatarUrl);
  }

  private mapFxStatusToDraft(status: IFxStatus & { id: string }, username: string): ITweetDraft {
    const imageUrls: string[] = [];
    const videoUrls: string[] = [];
    const videoPosterUrls: string[] = [];

    for (const item of status.media?.all ?? []) {
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
      } else if (!imageUrls.includes(url)) {
        imageUrls.push(url);
      }
    }

    const publishedAt = this.resolvePublishedAt(status);
    const text = status.text?.trim() ?? '';

    return {
      externalId: status.id,
      username,
      text,
      link: status.url ?? `https://x.com/${username}/status/${status.id}`,
      imageUrls,
      videoUrls,
      videoPosterUrls,
      hasVideo: videoUrls.length > 0,
      likeCount: this.toCount(status.likes),
      replyCount: this.toCount(status.replies),
      retweetCount: this.toCount(status.reposts),
      quoteCount: this.toCount(status.quotes),
      publishedAt,
    };
  }

  private resolvePublishedAt(status: IFxStatus): Date {
    if (typeof status.created_timestamp === 'number' && Number.isFinite(status.created_timestamp)) {
      return new Date(status.created_timestamp * 1000);
    }

    if (status.created_at) {
      const parsed = new Date(status.created_at);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    return new Date();
  }

  private toCount(value: number | undefined): number {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      return 0;
    }
    return Math.floor(value);
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

  private async fetchFromInstance(
    baseUrl: string,
    username: string,
    limit: number,
  ): Promise<ITweetDraft[]> {
    const feedUrl = `${baseUrl.replace(/\/$/, '')}/${username}/rss`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(feedUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
          'Accept-Encoding': 'identity',
          'Accept-Language': 'en-US,en;q=0.9',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const xml = Buffer.from(await response.arrayBuffer()).toString('utf8');
      if (!xml.includes('<item')) {
        throw new Error('empty feed');
      }

      return this.parseRss(xml, username, limit);
    } finally {
      clearTimeout(timeout);
    }
  }

  private parseRss(xml: string, username: string, limit: number): ITweetDraft[] {
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, limit);
    const drafts: ITweetDraft[] = [];

    for (const match of items) {
      const itemXml = match[1] ?? '';
      const link = this.decodeXml(this.extractTag(itemXml, 'link') ?? '');
      const title = this.decodeXml(this.extractTag(itemXml, 'title') ?? '');
      const descriptionRaw = this.decodeXml(this.extractTag(itemXml, 'description') ?? '');
      const media = this.extractMedia(descriptionRaw);
      const description = this.stripHtml(descriptionRaw);
      const pubDateRaw = this.extractTag(itemXml, 'pubDate');
      const externalId = this.extractExternalId(link, itemXml);

      if (!externalId) {
        continue;
      }

      const publishedAt = pubDateRaw ? new Date(pubDateRaw) : new Date();
      if (Number.isNaN(publishedAt.getTime())) {
        continue;
      }

      const text = (description || title).trim();
      if (!text && media.imageUrls.length === 0 && !media.hasVideo) {
        continue;
      }

      drafts.push({
        externalId,
        username,
        text,
        link: `https://x.com/${username}/status/${externalId}`,
        imageUrls: media.imageUrls,
        videoUrls: [],
        videoPosterUrls: media.videoPosterUrls,
        hasVideo: media.hasVideo,
        likeCount: 0,
        replyCount: 0,
        retweetCount: 0,
        quoteCount: 0,
        publishedAt,
      });
    }

    return drafts;
  }

  private extractMedia(descriptionHtml: string): {
    imageUrls: string[];
    videoPosterUrls: string[];
    hasVideo: boolean;
  } {
    const imageUrls: string[] = [];
    const videoPosterUrls: string[] = [];
    const markedAsVideo = /<br\s*\/?>\s*Video\s*<br\s*\/?>/i.test(descriptionHtml) || />\s*Video\s*</i.test(descriptionHtml);

    for (const match of descriptionHtml.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
      const normalized = this.normalizeMediaUrl(match[1] ?? '');
      if (!normalized) {
        continue;
      }

      if (VIDEO_THUMB_PATTERN.test(normalized)) {
        if (!videoPosterUrls.includes(normalized)) {
          videoPosterUrls.push(normalized);
        }
      } else if (!imageUrls.includes(normalized)) {
        imageUrls.push(normalized);
      }
    }

    return {
      imageUrls,
      videoPosterUrls,
      hasVideo: markedAsVideo || videoPosterUrls.length > 0,
    };
  }

  private normalizeMediaUrl(rawSrc: string): string | null {
    const src = rawSrc.trim();
    if (!src) {
      return null;
    }

    if (/^https?:\/\/(pbs|video)\.twimg\.com\//i.test(src)) {
      return src;
    }

    try {
      const url = new URL(src);
      const picMatch = url.pathname.match(/\/pic\/(.+)$/i);
      if (!picMatch?.[1]) {
        return null;
      }

      const decoded = decodeURIComponent(picMatch[1]);
      if (/^https?:\/\/(pbs|video)\.twimg\.com\//i.test(decoded)) {
        return decoded;
      }

      return `https://pbs.twimg.com/${decoded.replace(/^\/+/, '')}`;
    } catch {
      return null;
    }
  }

  private extractExternalId(link: string, itemXml: string): string | null {
    const fromLink = link.match(/status(?:es)?\/(\d+)/i)?.[1];
    if (fromLink) {
      return fromLink;
    }

    const guid = this.decodeXml(this.extractTag(itemXml, 'guid') ?? '');
    const fromGuid = guid.match(/(\d{5,})/)?.[1];
    return fromGuid ?? null;
  }

  private extractTag(xml: string, tag: string): string | null {
    const cdataMatch = xml.match(
      new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'),
    );
    if (cdataMatch?.[1] !== undefined) {
      return cdataMatch[1];
    }

    const plainMatch = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    return plainMatch?.[1] ?? null;
  }

  private decodeXml(value: string): string {
    return value
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }

  private stripHtml(value: string): string {
    return value
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
