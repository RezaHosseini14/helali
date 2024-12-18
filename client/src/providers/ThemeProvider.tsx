'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ReactNode, useEffect } from 'react';

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const darkMode = useSelector((state: RootState) => state.style.darkMode);

  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      htmlElement.classList.add('dark');
      htmlElement.classList.remove('light');
    } else {
      htmlElement.classList.add('light');
      htmlElement.classList.remove('dark');
    }
  }, [darkMode]);

  return <>{children}</>;
};

export default ThemeProvider;
