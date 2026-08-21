'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useTrackMediaLike } from '@/features/media/hooks/use-track-media-like';
import { useTrackMediaView } from '@/features/media/hooks/use-track-media-view';
import { ErrorState } from '@/components/ui/error-state';
import CommentsBox from '@/components/pages/front/audioPage/CommentsBox';
import VideoSuggests from '@/components/pages/front/videoPage/VideoSuggests';
import VideoDetails from '@/components/pages/front/videoPage/VideoDetails';
import VideoDetailsLoading from '@/components/pages/front/videoPage/VideoDetailsLoading';
import { getApiErrorMessage } from '@/services/get-api-error-message';
import { videoById } from 'services/video/videoServices';
import type { videoTypes } from 'types/video.type';

interface IVideoByIdResponse {
  data?: {
    video?: videoTypes;
  };
}

interface IVideoDetailClientProps {
  readonly videoId: number;
}

export function VideoDetailClient({ videoId }: IVideoDetailClientProps) {
  const queryClient = useQueryClient();

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['videoById', String(videoId)],
    queryFn: () => videoById(videoId),
  });

  const video = data?.data?.video as videoTypes | undefined;

  const trackView = useTrackMediaView('video', videoId, {
    onCounted: (views) => {
      queryClient.setQueryData(
        ['videoById', String(videoId)],
        (current: IVideoByIdResponse | undefined) => {
          if (!current?.data?.video) {
            return current;
          }

          return {
            ...current,
            data: {
              ...current.data,
              video: {
                ...current.data.video,
                view: views,
              },
            },
          };
        },
      );
    },
  });

  const { like: trackLike, likes, hasLiked } = useTrackMediaLike('video', videoId, {
    initialLikes: video?.like ?? 0,
    onCounted: (nextLikes) => {
      queryClient.setQueryData(
        ['videoById', String(videoId)],
        (current: IVideoByIdResponse | undefined) => {
          if (!current?.data?.video) {
            return current;
          }

          return {
            ...current,
            data: {
              ...current.data,
              video: {
                ...current.data.video,
                like: nextLikes,
              },
            },
          };
        },
      );
    },
  });

  return (
    <div className="relative min-h-[70vh]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(15,110,97,0.08),transparent_65%)]" />

      <div className="container relative grid grid-cols-12 gap-6 pt-28 pb-28 lg:gap-8 sm:pb-24">
        <div className="col-span-12 flex w-full flex-col gap-6 lg:col-span-9 lg:gap-8">
          {isPending ? (
            <VideoDetailsLoading />
          ) : isError ? (
            <ErrorState
              title="بارگذاری ویدیو ناموفق بود"
              description={getApiErrorMessage(error)}
              onRetry={() => void refetch()}
            />
          ) : !video ? (
            <ErrorState
              title="ویدیو یافت نشد"
              description="این ویدیو در دسترس نیست یا حذف شده است."
              onRetry={() => void refetch()}
            />
          ) : (
            <VideoDetails
              video={video}
              isLoading={false}
              onPlay={trackView}
              onLike={trackLike}
              likes={likes}
              hasLiked={hasLiked}
            />
          )}
          <CommentsBox id={videoId} type="video" />
        </div>

        <div className="col-span-12 lg:col-span-3">
          <VideoSuggests currentId={videoId} />
        </div>
      </div>
    </div>
  );
}
