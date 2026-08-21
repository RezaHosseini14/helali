import type { MetadataRoute } from 'next';

import { BRAND_COLORS } from '@/lib/brand';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    lang: 'fa',
    dir: 'rtl',
    background_color: BRAND_COLORS.paper,
    theme_color: BRAND_COLORS.primary,
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
