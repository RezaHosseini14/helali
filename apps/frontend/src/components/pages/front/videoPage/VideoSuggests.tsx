'use client';

import Link from 'next/link';

import ImageWithLoader from '@/components/global/ImageWithLoader';
import { useVideoSuggestions } from '@/features/video/hooks/use-video-suggestions';
import { cn } from '@/lib/utils';

import VideoSuggestsLoading from './VideoSuggestsLoading';

interface IVideoSuggestsProps {
  currentId: number;
}

interface ISuggestedVideo {
  readonly id: number;
  readonly title: string;
  readonly like?: number;
  readonly view?: number;
  readonly path?: string;
  readonly posterPath?: string;
  readonly videoUrl?: string;
  readonly posterUrl?: string;
}

function VideoSuggests({ currentId }: IVideoSuggestsProps) {
  const { data, isPending } = useVideoSuggestions(currentId, 5);

  if (isPending) {
    return <VideoSuggestsLoading />;
  }

  const suggestedVideos = (data?.videos ?? []) as unknown as ISuggestedVideo[];

  return (
    <aside className="sticky top-24 flex flex-col gap-3">
      <h2 className="px-1 text-sm font-semibold text-foreground">ویدیوهای پیشنهادی</h2>

      {suggestedVideos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card/60 px-4 py-8 text-center text-sm text-muted-foreground">
          موردی برای نمایش نیست
        </p>
      ) : (
        suggestedVideos.map((video) => (
          <Link
            key={video.id}
            href={`/video/${video.id}`}
            className={cn(
              'group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-2.5 shadow-sm transition',
              'hover:border-primary/30 hover:bg-secondary/60 hover:shadow-md',
            )}
          >
            <div className="relative size-18 shrink-0 overflow-hidden rounded-xl bg-muted">
              <ImageWithLoader
                src={video.posterPath ?? video.posterUrl ?? ''}
                alt={video.title}
              />
              <div className="absolute inset-0 grid place-content-center bg-mainstructure/0 opacity-0 transition group-hover:bg-mainstructure/45 group-hover:opacity-100">
                <i className="ki-solid ki-to-right text-2xl text-white" />
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="truncate text-sm font-semibold text-foreground transition group-hover:text-primary">
                {video.title}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <i className="ki-outline ki-heart" />
                  {video.like ?? 0}
                </span>
                <span className="size-1 rounded-full bg-border" />
                <span className="inline-flex items-center gap-1">
                  <i className="ki-outline ki-eye" />
                  {video.view ?? 0}
                </span>
              </div>
            </div>
          </Link>
        ))
      )}
    </aside>
  );
}

export default VideoSuggests;
