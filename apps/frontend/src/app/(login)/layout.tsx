import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import UiProvider from '@/src/providers/UiProvider';

import '@/assets/css/style.css';

export const metadata: Metadata = {
  title: `ورود | ${process.env.APP_TITLE}`,
  description: 'ورود',
};

interface ILoginRouteLayoutProps {
  readonly children: ReactNode;
}

export default function LoginRouteLayout({ children }: ILoginRouteLayoutProps) {
  return <UiProvider>{children}</UiProvider>;
}
