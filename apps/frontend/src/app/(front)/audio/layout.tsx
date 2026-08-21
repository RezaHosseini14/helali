import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'صوت',
  description: 'آرشیو صوت‌های عبدالرضا هلالی',
  path: '/audio',
});

export default function AudioSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
