'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as ReduxProvider } from 'react-redux';
import { useState, type ReactNode } from 'react';

import { AbilityProvider } from '@/features/auth/context/ability-provider';
import { store } from '@/store';
import ThemeProvider from '@/src/providers/ThemeProvider';

interface IProvidersProps {
  readonly children: ReactNode;
}

export function Providers({ children }: IProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AbilityProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AbilityProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
