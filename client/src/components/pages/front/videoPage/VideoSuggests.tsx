'use client';

import { useQuery } from '@tanstack/react-query';

// Types
import { videoTypes } from 'types/video.type';

// Services
import { allVideo } from 'services/video/videoServices';

// Components
import ImageWithLoader from '@/components/global/ImageWithLoader';
import VideoSuggestsLoading from './VideoSuggestsLoading';
import Link from 'next/link';
import { getRandomNumber } from 'utils/functions';
import { Icon } from '@iconify/react';

function VideoSuggests() {
  // ---------------------- Data Fetching ----------------------
  const { data, isLoading } = useQuery({
    queryKey: ['allvideo', { page: undefined, limit: 5 }],
    queryFn: ({ queryKey }: { queryKey: [string, { page?: number; limit?: number }] }) => {
      const [, params] = queryKey;
      return allVideo(params.page, params.limit);
    },
  });

  return (
    <div className="flex flex-col gap-4 sticky top-4">
      {isLoading ? (
        <VideoSuggestsLoading />
      ) : (
        <>
          {data?.data.videos?.map((video: videoTypes) => (
            <div key={video.id} className="flex gap-2 items-center bg-white/50 rounded-xl p-2 h-24">
              <Link
                href={`${video.id}`}
                className="group rounded-lg bg-white aspect-video h-full overflow-hidden relative"
              >
                <ImageWithLoader src={video.posterPath} alt={video.title} />
                <div className="group-hover:scale-125 transition-transform text-white bg-mainColor/70 backdrop-blur-md size-10 grid place-content-center text-4xl right-1/2 top-1/2 translate-x-1/2 -translate-y-1/2 z-10 absolute rounded-full shadow-sm">
                  <i className="ki-solid ki-to-right"></i>
                </div>
              </Link>

              <div className="flex flex-col flex-1 gap-2 h-full justify-end">
                <p className="text-mainColor h2 text-xl text-right truncate w-36">{video.title}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-md overflow-hidden px-1 h-6 text-base">
                    <span>{video.like > 100 ? video.like : getRandomNumber()}</span>
                    <i className="ki-outline ki-heart"></i>
                  </div>
                  <div className="h-3 w-[1px] bg-mainColor"></div>
                  <div className="flex items-center gap-1 rounded-md overflow-hidden px-1 h-6 text-base">
                    <span>{video.view > 1000 ? video.view : getRandomNumber(1000, 10000)}</span>
                    <i className="ki-outline ki-eye"></i>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default VideoSuggests;
