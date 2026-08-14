'use client';

import { useEffect, type ReactNode } from 'react';
import { useDispatch } from 'react-redux';

import { useAudios } from '@/features/audio/hooks/use-audios';
import FrontFooter from '@/components/layouts/front/FrontFooter';
import Header from '@/components/layouts/front/Header';
import { setQueue, setQueueLoading } from '@/redux/slices/audioSlice';
import type { AppDispatch } from '@/redux/store';
import type { audioTypes } from 'types/audio.type';

interface IFrontLayoutProps {
  readonly children: ReactNode;
}

export default function FrontLayout({ children }: IFrontLayoutProps) {
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
    <div className="front flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <FrontFooter />
    </div>
  );
}
