import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import 'rsuite/dist/rsuite-rtl.min.css';
import './globals.css';
import '@/assets/css/style.css';
import '@/assets/fonts/keenicons/icon.css';
import '@/assets/fonts/ERPyb/ERPyb.css';

import 'plyr/dist/plyr.css';
// import RsuiteProvider from 'providers/RsuiteProvider';
// import ReactQueryProvider from 'providers/ReactQueryProvider';
// import ReduxProvider from 'providers/ReduxProvider';

const RsuiteProvider = dynamic(() => import('providers/RsuiteProvider'), { ssr: false });
const ReactQueryProvider = dynamic(() => import('providers/ReactQueryProvider'), { ssr: false });
const ReduxProvider = dynamic(() => import('providers/ReduxProvider'), { ssr: false });

export const metadata: Metadata = {
  title: 'پایگاه‌حفظ‌ونشر‌آثار‌عبدالرضاهلالی',
  description: 'پایگاه‌حفظ‌ونشر‌آثار‌عبدالرضاهلالی',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <ReduxProvider>
          <RsuiteProvider>
            <ReactQueryProvider>{children}</ReactQueryProvider>
          </RsuiteProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
