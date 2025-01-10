import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

//Css
import '@/assets/css/children.css';

//Layouts
import ChildrenLayout from '@/layouts/children/ChildrenLayout';

//Components
import AudioPlayer from '@/components/global/AudioPlayer';
const RsuiteProvider = dynamic(() => import('providers/RsuiteProvider'), { ssr: false });

export const metadata: Metadata = {
  title: 'پایگاه‌حفظ‌ونشر‌آثار‌عبدالرضاهلالی',
  description: 'عزیزم‌حسین‌(ع)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="children">
        <RsuiteProvider>
          <ChildrenLayout>{children}</ChildrenLayout>
          <AudioPlayer />
        </RsuiteProvider>
      </body>
    </html>
  );
}
