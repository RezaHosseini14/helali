import type { ReactNode } from 'react';

import FrontLayout from '@/layouts/front/FrontLayout';
import AudioPlayer from '@/components/global/AudioPlayer';
import UiProvider from '@/src/providers/UiProvider';

import '@/assets/css/main.css';
import '@/assets/css/style.css';
import '@/assets/fonts/pinar/pinar.css';
import '@/assets/fonts/gofteh/gofteh.css';
import '@/assets/fonts/potk/potk.css';

interface IFrontRouteLayoutProps {
  readonly children: ReactNode;
}

export default function FrontRouteLayout({ children }: IFrontRouteLayoutProps) {
  return (
    <UiProvider>
      <FrontLayout>{children}</FrontLayout>
      <AudioPlayer />
    </UiProvider>
  );
}
