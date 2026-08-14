'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  DEFAULT_THEME,
  LEGACY_DARK_MODE_KEY,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from '@/lib/theme';
import type { RootState } from '@/store';
import { SET_DARK_MODE } from '@/src/redux/slices/styleSlice';

interface IThemeProviderProps {
  readonly children: ReactNode;
}

function resolveStoredTheme(): ThemeMode {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  const legacy = window.localStorage.getItem(LEGACY_DARK_MODE_KEY);
  if (legacy === 'true') {
    return 'dark';
  }
  if (legacy === 'false') {
    return 'light';
  }

  if (document.documentElement.classList.contains('dark')) {
    return 'dark';
  }

  return DEFAULT_THEME;
}

function applyThemeToDocument(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(mode);
  root.style.colorScheme = mode;
  root.setAttribute('data-theme', mode);
  window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  window.localStorage.setItem(LEGACY_DARK_MODE_KEY, String(mode === 'dark'));
}

export function ThemeProvider({ children }: IThemeProviderProps) {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.style.darkMode);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const resolved = resolveStoredTheme();
    dispatch(SET_DARK_MODE(resolved === 'dark'));
    applyThemeToDocument(resolved);
    setIsReady(true);
  }, [dispatch]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    applyThemeToDocument(darkMode ? 'dark' : 'light');
  }, [darkMode, isReady]);

  return children;
}

export default ThemeProvider;
