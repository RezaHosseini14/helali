import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { JsonLd } from '@/components/seo/json-ld';
import { Providers } from '@/lib/providers';
import { rootMetadata, siteGraphJsonLd } from '@/lib/seo';
import { SITE_THEME_COLOR } from '@/lib/site';
import { THEME_INIT_SCRIPT } from '@/lib/theme';
import { cn } from '@/lib/utils';

import './globals.css';
import '@/assets/fonts/keenicons/icon.css';
import '@/assets/fonts/ERPyb/ERPyb.css';

export const metadata: Metadata = rootMetadata();

export const viewport: Viewport = {
  themeColor: SITE_THEME_COLOR,
  width: 'device-width',
  initialScale: 1,
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
        <JsonLd data={siteGraphJsonLd()} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
