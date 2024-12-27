'use client';
import { ReactNode, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';

//Slices
import { SET_AUDIOS, SET_AUDIOS_LOADING } from '@/redux/slices/audioSlice';

//Services
import { allAudio } from 'services/audio/audioServices';

//Components
import Header from './Header';
import MainMenu from '@/components/layouts/main/MainMenu';
import SocialMediaMenu from '@/components/layouts/main/SocialMediaMenu';

function MainLayout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const { data, isLoading } = useQuery({
    queryKey: ['allAudio'],
    queryFn: () => allAudio(),
  });

  useEffect(() => {
    if (data?.data?.audios && data?.data?.audios?.length > 0) {
      dispatch(SET_AUDIOS(data.data.audios));
    }
  }, [data, dispatch]);

  useEffect(() => {
    dispatch(SET_AUDIOS_LOADING(isLoading));
  }, [isLoading]);

  return (
    <div className="pb-32">
      <div className="container">
        <Header />
      </div>
      {children}
      <MainMenu />
      <SocialMediaMenu />
    </div>
  );
}

export default MainLayout;
