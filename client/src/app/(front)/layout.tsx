import MainLayout from '@/layouts/main/MainLayout';
import type { Metadata } from 'next';

//Css
import '@/assets/css/main.css';

//Providers
import RsuiteProvider from 'providers/RsuiteProvider';

//Components
import AudioPlayer from '@/components/global/AudioPlayer';

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
