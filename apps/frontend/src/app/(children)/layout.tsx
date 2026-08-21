import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import ChildrenLayout from '@/layouts/children/ChildrenLayout';
import AudioPlayer from '@/components/global/AudioPlayer';
import { buildPageMetadata } from '@/lib/seo';
import UiProvider from '@/src/providers/UiProvider';

import '@/assets/css/style.css';
import '@/assets/fonts/pinar/pinar.css';
import '@/assets/fonts/gofteh/gofteh.css';
import '@/assets/fonts/potk/potk.css';
import '@/assets/css/children.css';

export const metadata: Metadata = buildPageMetadata({
  title: 'عزیزم حسین(ع)',
  description: 'عزیزم حسین(ع) — بخش ویژه کودکان',
  path: '/children',
});

interface IChildrenRouteLayoutProps {
  readonly children: ReactNode;
}

export default function ChildrenRouteLayout({ children }: IChildrenRouteLayoutProps) {
  return (
    <div className="children min-h-screen">
      <UiProvider>
        <ChildrenLayout>{children}</ChildrenLayout>
        <AudioPlayer />
      </UiProvider>
    </div>
  );
}
