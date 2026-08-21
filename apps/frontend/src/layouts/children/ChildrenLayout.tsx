'use client';

import { useEffect, type ReactNode } from 'react';
import { useDispatch } from 'react-redux';

import { useAudios } from '@/features/audio/hooks/use-audios';
import { setQueue, setQueueLoading } from '@/redux/slices/audioSlice';
import type { AppDispatch } from '@/redux/store';
import type { audioTypes } from 'types/audio.type';

interface IChildrenLayoutProps {
  readonly children: ReactNode;
}

function ChildrenLayout({ children }: IChildrenLayoutProps) {
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

  return <div className="flex flex-col gap-16 pb-8">{children}</div>;
}

export default ChildrenLayout;
