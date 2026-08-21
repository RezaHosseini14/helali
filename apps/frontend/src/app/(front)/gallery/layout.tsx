import type { Metadata } from 'next';

import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'گالری',
  description: 'گالری تصاویر پایگاه عبدالرضا هلالی',
  path: '/gallery',
});

export default function GallerySegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
