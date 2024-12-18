import MainLayout from '@/layouts/main/MainLayout';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import AudioPlayer from '@/components/global/AudioPlayer';
import '@/assets/css/main.css';

const RsuiteProvider = dynamic(() => import('providers/RsuiteProvider'), { ssr: false });

export const metadata: Metadata = {
  title: 'پایگاه‌حفظ‌ونشر‌آثار‌عبدالرضاهلالی',
  description: 'پایگاه‌حفظ‌ونشر‌آثار‌عبدالرضاهلالی',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <RsuiteProvider>
          <MainLayout>{children}</MainLayout>
          <AudioPlayer />
        </RsuiteProvider>
      </body>
    </html>
  );
}
