'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Pagination } from 'rsuite';
import { motion } from 'framer-motion';

// Functions
import { getRandomNumber } from 'utils/functions';

// Services
import { allVideo } from 'services/video/videoServices';

// Types
import { videoTypes } from 'types/video.type';

// Components
import ImageWithLoader from '@/components/global/ImageWithLoader';
import PlayIcon from '@/components/global/icons/PlayIcon';
import VideosPageLoading from '@/components/pages/front/videosPage/VideosPageLoading';

function VideoPage() {
  // ---------------------- State and Ref ----------------------
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);

  // ---------------------- Data Fetching ----------------------
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['allvideo', { page, limit }],
    queryFn: ({ queryKey }: { queryKey: [string, { page: number; limit: number }] }) => {
      const [, params] = queryKey;
      return allVideo(params.page, params.limit);
    },
  });

  return (
    <div className="container mt-8 pb-20 space-y-8">
      {isLoading || isFetching ? (
        <VideosPageLoading count={12} />
      ) : (
        <>
          <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
            {data?.data?.videos?.length > 0 ? (
              data?.data?.videos?.map((video: videoTypes) => (
                <motion.div
                  key={video.id}
                  className="group flex flex-col gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <Link href={`/video/${video.id}`} className="relative rounded-xl !overflow-hidden aspect-video">
                    <PlayIcon />
                    <ImageWithLoader
                      className="object-scale-down w-full h-full"
                      src={video.posterPath}
                      alt={video.title}
                    />
                  </Link>
                  <div className="flex justify-between items-center">
                    <p className="text-mainColor h2 text-xl">{video.title}</p>

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
                </motion.div>
              ))
            ) : (
              <div className="col-span-4 grid place-content-center">ویدیویی یافت نشد</div>
            )}
          </div>
          <Pagination
            className="sp_pagination justify-center"
            prev
            next
            size="md"
            total={data?.data?.total}
            limit={limit}
            activePage={data?.data?.page}
            onChangePage={setPage}
          />
        </>
      )}
    </div>
  );
}

export default VideoPage;
