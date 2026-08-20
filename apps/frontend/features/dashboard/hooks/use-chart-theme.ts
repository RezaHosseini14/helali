'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { BRAND_COLORS } from '@/lib/brand';
import { hexToRgba, readCssVariable } from '@/lib/css-colors';
import type { RootState } from '@/store';

export interface IDashboardChartTheme {
  readonly primary: string;
  readonly accent: string;
  readonly structure: string;
  readonly chart3: string;
  readonly chart4: string;
  readonly foreground: string;
  readonly mutedForeground: string;
  readonly border: string;
  readonly card: string;
  readonly tooltipBg: string;
  readonly tooltipBorder: string;
  readonly splitLine: string;
  readonly axisLabel: string;
}

function resolveChartTheme(): IDashboardChartTheme {
  const primary = readCssVariable('--primary', BRAND_COLORS.primary);
  const accent = readCssVariable('--brand-accent', BRAND_COLORS.accent);
  const structure = readCssVariable('--chart-5', BRAND_COLORS.structure);
  const chart3 = readCssVariable('--chart-3', '#5c736e');
  const chart4 = readCssVariable('--chart-4', '#3ecfba');
  const foreground = readCssVariable('--foreground', BRAND_COLORS.ink);
  const mutedForeground = readCssVariable('--muted-foreground', '#5c736e');
  const border = readCssVariable('--border', '#d2e2de');
  const card = readCssVariable('--card', '#ffffff');

  return {
    primary,
    accent,
    structure,
    chart3,
    chart4,
    foreground,
    mutedForeground,
    border,
    card,
    tooltipBg: card,
    tooltipBorder: border,
    splitLine: hexToRgba(border, 0.65),
    axisLabel: mutedForeground,
  };
}

export function useChartTheme(): IDashboardChartTheme {
  const darkMode = useSelector((state: RootState) => state.style.darkMode);
  const [theme, setTheme] = useState<IDashboardChartTheme>(resolveChartTheme);

  useEffect(() => {
    setTheme(resolveChartTheme());
  }, [darkMode]);

  return theme;
}
