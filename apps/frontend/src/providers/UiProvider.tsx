'use client';

import { type ReactNode } from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';

interface IUiProviderProps {
  readonly children: ReactNode;
}

export function UiProvider({ children }: IUiProviderProps) {
  return <TooltipProvider>{children}</TooltipProvider>;
}

export default UiProvider;
