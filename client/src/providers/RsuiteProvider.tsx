'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { CustomProvider } from 'rsuite';
import fa_IR from 'rsuite/locales/fa_IR';

interface RsuiteProviderProps {
  children: ReactNode;
}

function RsuiteProvider({ children }: RsuiteProviderProps) {
  return (
    <CustomProvider locale={fa_IR} rtl theme='light'>
      {children}
      <Toaster />
    </CustomProvider>
  );
}

export default RsuiteProvider;
