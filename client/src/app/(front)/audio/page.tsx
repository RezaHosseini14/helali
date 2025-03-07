'use client';

import { useState } from 'react';
import { Pagination } from 'rsuite';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

// Services
import { allAudio } from 'services/audio/audioServices';

// Types
import { audioTypes } from 'types/audio.type';

// Components
import AudioPreview from '@/components/global/AudioPreview';
import AudiosPageLoading from '@/components/pages/front/audiosPage/AudiosPageLoading';

function AudiousPage() {
  // ---------------------- State and Ref ----------------------
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(16);

  // ---------------------- Data Fetching ----------------------
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['allAudio', { page, limit }],
    queryFn: ({ queryKey }: { queryKey: [string, { page: number; limit: number }] }) => {
      const [, params] = queryKey;
      return allAudio(params.page, params.limit);
    },
  });

  return (
    <div className="container mt-12 pb-20 space-y-8">
      {isLoading || isFetching ? (
        <AudiosPageLoading count={16} />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-y-10 gap-x-4">
            {data?.data?.audios?.length > 0 ? (
              data?.data?.audios?.map((audio: audioTypes) => (
                <motion.div
                  key={audio.id}
                  className="group flex flex-col gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <AudioPreview {...audio} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-4 grid place-content-center">صوتی یافت نشد</div>
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

export default AudiousPage;
