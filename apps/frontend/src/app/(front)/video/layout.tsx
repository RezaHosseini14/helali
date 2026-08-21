import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'ویدیو',
  description: 'آرشیو ویدیوهای عبدالرضا هلالی',
  path: '/video',
});

export default function VideoSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
