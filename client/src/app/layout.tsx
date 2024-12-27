import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

//Css
import 'rsuite/dist/rsuite-no-reset-rtl.min.css';
import './globals.css';
import '@/assets/css/style.css';
import '@/assets/fonts/keenicons/icon.css';
import '@/assets/fonts/ERPyb/ERPyb.css';
import '@/assets/fonts/pinar/pinar.css';
import 'plyr/dist/plyr.css';

//Providers
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
      <body className="main">
        <ReduxProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
