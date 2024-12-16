'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ReactNode, useEffect } from 'react';

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const darkMode = useSelector((state: RootState) => state.style.darkMode);

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return <>{children}</>;
};

export default ThemeProvider;
