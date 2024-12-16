'use client';

import { RootState } from '@/redux/store';
import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { CustomProvider } from 'rsuite';
import fa_IR from 'rsuite/locales/fa_IR';

interface RsuiteProviderProps {
  children: ReactNode;
}

function RsuiteProvider({ children }: RsuiteProviderProps) {
  const { darkMode } = useSelector((state: RootState) => state.style);
  return (
    <CustomProvider locale={fa_IR} theme={darkMode ? 'dark' : 'light'} rtl>
      {children}
      <Toaster />
    </CustomProvider>
  );
}

export default RsuiteProvider;
