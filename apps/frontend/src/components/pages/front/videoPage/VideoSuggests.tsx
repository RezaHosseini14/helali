'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import ImageWithLoader from '@/components/global/ImageWithLoader';
import { cn } from '@/lib/utils';
import { allVideo } from 'services/video/videoServices';
import type { videoTypes } from 'types/video.type';

import VideoSuggestsLoading from './VideoSuggestsLoading';

interface IVideoSuggestsProps {
  currentId?: number;
}

function VideoSuggests({ currentId }: IVideoSuggestsProps) {
  const { data, isPending } = useQuery({
    queryKey: ['allvideo', { page: undefined, limit: 6 }],
    queryFn: ({ queryKey }: { queryKey: [string, { page?: number; limit?: number }] }) => {
      const [, params] = queryKey;
      return allVideo(params.page, params.limit);
    },
  });

  if (isPending) {
    return <VideoSuggestsLoading />;
  }

  const suggestedVideos =
    (data?.data.videos as videoTypes[] | undefined)
      ?.filter((video) => video.id !== currentId)
      .slice(0, 5) ?? [];

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
            <div className="relative aspect-video h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
              <ImageWithLoader src={video.posterPath} alt={video.title} />
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
