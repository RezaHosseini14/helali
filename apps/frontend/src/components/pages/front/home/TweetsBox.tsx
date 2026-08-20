'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import type { ITweet } from '@helali/shared';

import Panel from '@/components/global/Panel';
import VideoPlayer from '@/components/global/VideoPlayer';
import { cn } from '@/lib/utils';

interface ITweetsBoxProps {
  readonly tweets: ReadonlyArray<ITweet>;
}

interface ITweetCardProps {
  readonly tweet: ITweet;
}

function formatTweetDate(publishedAt: string): string {
  if (!publishedAt) return '';
  return new Date(publishedAt).toLocaleDateString('fa-IR', {
    day: 'numeric',
    month: 'long',
  });
}

function formatCount(value: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
  return new Intl.NumberFormat('fa-IR').format(safe);
}

function TweetCard({ tweet }: ITweetCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const imageUrls = tweet.imageUrls ?? [];
  const videoUrls = tweet.videoUrls ?? [];
  const videoPosterUrls = tweet.videoPosterUrls ?? [];
  const hasVideo = Boolean(tweet.hasVideo || videoUrls.length > 0);
  const normalizedText = tweet.text?.replace(/\s+/g, ' ').trim() ?? '';
  const isLongText = normalizedText.length > 160;
  const displayText =
    normalizedText && !isExpanded && isLongText
      ? `${normalizedText.slice(0, 160).trimEnd()}…`
      : normalizedText;

  return (
    <li className="group relative flex h-full min-h-[17rem] flex-col overflow-hidden rounded-[1.75rem] border border-primary/10 bg-gradient-to-br from-card via-card to-primary/[0.06] p-5 shadow-[0_18px_40px_-28px_rgb(15_110_97_/_0.55)] transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_24px_48px_-24px_rgb(15_110_97_/_0.65)]">
      <div
        className="pointer-events-none absolute -start-10 top-0 size-36 rounded-full bg-primary/10 blur-3xl transition duration-500 group-hover:bg-primary/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-8 -bottom-10 size-28 rounded-full bg-accent/10 blur-3xl"
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <span className="grid size-9 shrink-0 place-content-center rounded-full bg-foreground/[0.04] text-foreground/70 transition group-hover:bg-primary/10 group-hover:text-primary">
          <Icon icon="hugeicons:new-twitter" width="18" height="18" />
        </span>

        <div className="flex min-w-0 flex-row items-center gap-3" dir="ltr">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-full border-2 border-primary/25 bg-primary/10 shadow-sm ring-4 ring-primary/5">
            {tweet.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tweet.avatarUrl}
                alt="عبدالرضا هلالی"
                loading="lazy"
                referrerPolicy="no-referrer"
                className="size-full object-cover"
              />
            ) : (
              <Image
                src="/images/helali.png"
                alt="عبدالرضا هلالی"
                fill
                sizes="56px"
                className="object-cover object-top"
              />
            )}
          </div>
          <div className="min-w-0 text-start">
            <h3 className="truncate text-base font-bold text-mainstructure" dir="rtl">
              عبدالرضا هلالی
            </h3>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              @{tweet.username}
            </p>
          </div>
        </div>
      </div>

      {displayText ? (
        <p className="relative mt-3 flex-1 text-sm leading-normal text-foreground/90">
          {displayText}
        </p>
      ) : (
        <div className="flex-1" />
      )}

      {isLongText ? (
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="relative mt-1 inline-flex items-center gap-1 self-start text-xs font-medium text-primary transition hover:text-primary/80"
        >
          {isExpanded ? 'بستن' : 'ادامه مطلب'}
          <i
            className={cn(
              'ki-outline ki-arrow-down text-[0.7rem] transition',
              isExpanded && 'rotate-180',
            )}
          />
        </button>
      ) : null}

      {imageUrls.length > 0 ? (
        <div
          className={cn(
            'relative mt-4 overflow-hidden rounded-2xl border border-border/30',
            imageUrls.length === 1 ? '' : 'grid grid-cols-2 gap-1.5',
          )}
        >
          {imageUrls.slice(0, 4).map((url, index) => (
            <div
              key={`${tweet.id}-img-${index}`}
              className="relative aspect-video overflow-hidden bg-muted/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                className="size-full object-cover transition duration-500 group-hover:scale-[1.02]"
              />
            </div>
          ))}
        </div>
      ) : null}

      {hasVideo
        ? videoUrls.map((url, index) => (
            <div
              key={`${tweet.id}-vid-${index}`}
              className="relative mt-4 overflow-hidden rounded-2xl border border-border/30"
              onClick={(event) => event.stopPropagation()}
            >
              <VideoPlayer
                src={url}
                poster={videoPosterUrls[index] ?? videoPosterUrls[0]}
                mimeType="video/mp4"
                compact
                variant="plain"
                className="aspect-video w-full"
              />
            </div>
          ))
        : null}

      {!hasVideo && videoPosterUrls.length > 0
        ? videoPosterUrls.slice(0, 1).map((url, index) => (
            <div
              key={`${tweet.id}-poster-${index}`}
              className="relative mt-4 aspect-video overflow-hidden rounded-2xl border border-border/30 bg-muted/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                className="size-full object-cover"
              />
            </div>
          ))
        : null}

      <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-primary/10 pt-4 text-xs text-muted-foreground">
        <time dateTime={tweet.publishedAt} className="inline-flex items-center gap-1.5">
          <i className="ki-outline ki-calendar text-sm text-primary/80" />
          {formatTweetDate(tweet.publishedAt)}
        </time>

        <ul className="flex flex-wrap items-center gap-3.5" dir="ltr">
          <li className="inline-flex items-center gap-1.5" title="پاسخ">
            <i className="ki-outline ki-messages text-sm" />
            <span>{formatCount(tweet.replyCount)}</span>
          </li>
          <li className="inline-flex items-center gap-1.5" title="ری‌توییت">
            <i className="ki-outline ki-arrows-loop text-sm" />
            <span>{formatCount(tweet.retweetCount)}</span>
          </li>
          <li className="inline-flex items-center gap-1.5" title="نقل‌قول">
            <i className="ki-outline ki-message-text text-sm" />
            <span>{formatCount(tweet.quoteCount)}</span>
          </li>
          <li className="inline-flex items-center gap-1.5" title="لایک">
            <i className="ki-outline ki-heart text-sm" />
            <span>{formatCount(tweet.likeCount)}</span>
          </li>
        </ul>
      </div>
    </li>
  );
}

function TweetsBox({ tweets }: ITweetsBoxProps) {
  const latestTweets = tweets.slice(0, 9);

  return (
    <Panel
      title="جدیدترین توییت‌ها"
      fill
      className="overflow-visible"
      icon={<Icon icon="hugeicons:new-twitter" width="22" height="22" />}
      moreButton={{
        url: `https://x.com/${latestTweets[0]?.username || 'helalireza'}`,
        title: 'مشاهده همه',
      }}
    >
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 lg:gap-5">
        {latestTweets.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} />
        ))}
      </ul>
    </Panel>
  );
}

export default TweetsBox;
