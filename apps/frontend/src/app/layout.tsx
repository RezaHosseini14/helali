import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Providers } from '@/lib/providers';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import { cn } from '@/lib/utils';

import './globals.css';
import '@/assets/fonts/keenicons/icon.css';
import '@/assets/fonts/ERPyb/ERPyb.css';

export const metadata: Metadata = {
  title: process.env.APP_TITLE,
  description: 'پایگاه‌حفظ‌ونشر‌آثار‌عبدالرضاهلالی',
};

interface IRootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: IRootLayoutProps) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={cn('font-sans')}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
