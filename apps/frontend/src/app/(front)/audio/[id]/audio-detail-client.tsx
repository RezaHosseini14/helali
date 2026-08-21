'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '@/redux/store';
import { playAudio, togglePlayback } from '@/redux/slices/audioSlice';
import type { AppDispatch } from '@/redux/store';

import { useTrackMediaLike } from '@/features/media/hooks/use-track-media-like';
import { useTrackMediaView } from '@/features/media/hooks/use-track-media-view';
import { audioById } from 'services/audio/audioServices';
import { getApiErrorMessage } from '@/services/get-api-error-message';

import { ErrorState } from '@/components/ui/error-state';
import CommentsBox from '@/components/pages/front/audioPage/CommentsBox';
import AudioSuggests from '@/components/pages/front/audioPage/AudioSuggests';
import AudioDetails from '@/components/pages/front/audioPage/AudioDetails';
import AudioDetailsLoading from '@/components/pages/front/audioPage/AudioDetailsLoading';
import type { audioTypes } from 'types/audio.type';

interface IAudioByIdResponse {
  data?: {
    audio?: audioTypes;
  };
}

interface IAudioDetailClientProps {
  readonly audioId: number;
}

export function AudioDetailClient({ audioId }: IAudioDetailClientProps) {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();
  const { currentId, isPlaying, isOpen } = useSelector((state: RootState) => state.audio);

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['audioById', String(audioId)],
    queryFn: () => audioById(audioId),
  });

  const trackView = useTrackMediaView('audio', audioId, {
    onCounted: (views) => {
      queryClient.setQueryData(
        ['audioById', String(audioId)],
        (current: IAudioByIdResponse | undefined) => {
          if (!current?.data?.audio) {
            return current;
          }

          return {
            ...current,
            data: {
              ...current.data,
              audio: {
                ...current.data.audio,
                view: views,
              },
            },
          };
        },
      );
    },
  });

  const audio = data?.data?.audio as audioTypes | undefined;
  const isThisTrack = currentId === audioId && isOpen;
  const isThisPlaying = isThisTrack && isPlaying;

  const { like: trackLike, likes, hasLiked } = useTrackMediaLike('audio', audioId, {
    initialLikes: audio?.like ?? 0,
    onCounted: (nextLikes) => {
      queryClient.setQueryData(
        ['audioById', String(audioId)],
        (current: IAudioByIdResponse | undefined) => {
          if (!current?.data?.audio) {
            return current;
          }

          return {
            ...current,
            data: {
              ...current.data,
              audio: {
                ...current.data.audio,
                like: nextLikes,
              },
            },
          };
        },
      );
    },
  });

  const handlePlay = () => {
    if (!audio) {
      return;
    }

    if (isThisTrack) {
      if (!isPlaying) {
        trackView();
      }
      dispatch(togglePlayback());
      return;
    }

    trackView();
    dispatch(playAudio(audio));
  };

  return (
    <div className="relative min-h-[70vh]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(15,110,97,0.08),transparent_65%)]" />

      <div className="container relative grid grid-cols-12 gap-6 pt-28 pb-28 lg:gap-8 sm:pb-24">
        <div className="col-span-12 flex w-full flex-col gap-6 lg:col-span-9 lg:gap-8">
          {isPending ? (
            <AudioDetailsLoading />
          ) : isError ? (
            <ErrorState
              title="بارگذاری صوت ناموفق بود"
              description={getApiErrorMessage(error)}
              onRetry={() => void refetch()}
            />
          ) : !audio ? (
            <ErrorState
              title="صوت یافت نشد"
              description="این فایل صوتی در دسترس نیست یا حذف شده است."
              onRetry={() => void refetch()}
            />
          ) : (
            <AudioDetails
              audio={audio}
              isPlaying={isThisPlaying}
              isActive={isThisTrack}
              handlePlay={handlePlay}
              isLoading={false}
              onLike={trackLike}
              likes={likes}
              hasLiked={hasLiked}
            />
          )}
          <CommentsBox id={audioId} type="audio" />
        </div>

        <div className="col-span-12 lg:col-span-3">
          <AudioSuggests currentId={audioId} />
        </div>
      </div>
    </div>
  );
}
