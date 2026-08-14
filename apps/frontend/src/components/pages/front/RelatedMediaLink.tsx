'use client';

import Link from 'next/link';

import { Icon } from '@iconify/react';

import ImageWithLoader from '@/components/global/ImageWithLoader';
import { cn } from '@/lib/utils';

import type { IRelatedMediaLinkProps } from 'types/related-media.type';

const MEDIA_CONFIG = {
  audio: {
    badge: 'صوت مرتبط',
    hrefPrefix: '/audio',
    icon: 'solar:music-note-2-bold-duotone',
  },
  video: {
    badge: 'ویدیوی مرتبط',
    hrefPrefix: '/video',
    icon: 'solar:videocamera-record-bold-duotone',
  },
} as const;

export default function RelatedMediaLink({ kind, media }: IRelatedMediaLinkProps) {
  const config = MEDIA_CONFIG[kind];

  return (
    <section className="rounded-2xl border border-border/60 bg-secondary/30 p-4">
      <p className="mb-3 text-sm font-semibold text-primary">{config.badge}</p>

      <Link
        href={`${config.hrefPrefix}/${media.id}`}
        className={cn(
          'group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm transition',
          'hover:border-primary/30 hover:bg-secondary/60 hover:shadow-md',
        )}
      >
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
          <ImageWithLoader src={media.posterPath} alt={media.title} />
          <div className="absolute inset-0 grid place-content-center bg-mainstructure/0 opacity-0 transition group-hover:bg-mainstructure/45 group-hover:opacity-100">
            <Icon icon={config.icon} className="size-6 text-white" />
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate text-sm font-semibold text-foreground transition group-hover:text-primary">
            {media.title}
          </p>
          <p className="text-xs text-muted-foreground">مشاهده {kind === 'audio' ? 'صوت' : 'ویدیو'}</p>
        </div>

        <Icon
          icon="solar:alt-arrow-left-linear"
          className="size-5 shrink-0 text-muted-foreground transition group-hover:text-primary"
        />
      </Link>
    </section>
  );
}
