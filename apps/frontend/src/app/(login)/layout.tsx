import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { buildPageMetadata } from '@/lib/seo';
import UiProvider from '@/src/providers/UiProvider';

import '@/assets/css/style.css';

export const metadata: Metadata = buildPageMetadata({
  title: 'ورود',
  description: 'ورود به پنل مدیریت',
  path: '/login',
  noIndex: true,
});

interface ILoginRouteLayoutProps {
  readonly children: ReactNode;
}

export default function LoginRouteLayout({ children }: ILoginRouteLayoutProps) {
  return <UiProvider>{children}</UiProvider>;
}
