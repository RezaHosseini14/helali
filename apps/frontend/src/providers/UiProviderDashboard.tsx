'use client';

import { type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

import { TooltipProvider } from '@/components/ui/tooltip';

interface IUiProviderDashboardProps {
  readonly children: ReactNode;
}

export function UiProviderDashboard({ children }: IUiProviderDashboardProps) {
  return (
    <TooltipProvider>
      {children}
      <Toaster
        toastOptions={{
          className: 'dark:bg-slate-800 dark:text-slate-100',
        }}
      />
    </TooltipProvider>
  );
}

export default UiProviderDashboard;
