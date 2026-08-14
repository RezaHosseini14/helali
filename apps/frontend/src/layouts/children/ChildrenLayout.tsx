'use client';

import { useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useDispatch } from 'react-redux';

import { useAudios } from '@/features/audio/hooks/use-audios';
import StarrySky from '@/components/StarrySky';
import ChildrenAlbum from '@/components/pages/children/ChildrenAlbum';
import ChildrenAudios from '@/components/pages/children/ChildrenAudios';
import ChildrenGallery from '@/components/pages/children/ChildrenGallery';
import Header from '@/components/layouts/children/Header';
import { setQueue, setQueueLoading } from '@/redux/slices/audioSlice';
import type { AppDispatch } from '@/redux/store';
import type { audioTypes } from 'types/audio.type';

function ChildrenLayout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isPending, isFetching } = useAudios(1, 50);

  useEffect(() => {
    dispatch(setQueueLoading(isPending || isFetching));
  }, [dispatch, isFetching, isPending]);

  useEffect(() => {
    if (!data?.audios) {
      return;
    }

    dispatch(setQueue(data.audios as unknown as audioTypes[]));
  }, [data, dispatch]);

  return (
    <div className="flex flex-col gap-16">
      <Header />

      <div className="container relative">
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -right-4 "
        >
          <Image src="/images/children/start.png" width={200} height={200} alt="start" />
        </motion.div>
        <ChildrenAudios />
      </div>

      <ChildrenAlbum />

      <StarrySky className="">
        <div className="absolute right-0 z-[1000]">asfgasf</div>
      </StarrySky>

      <div className="cloud-pattern w-full bg-childrencolor py-8">
        <ChildrenGallery />
      </div>

      {children}
    </div>
  );
}

export default ChildrenLayout;
