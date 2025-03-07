import type { Metadata } from 'next';

//Css
import './globals.css';
import '@/assets/css/style.css';
import '@/assets/fonts/keenicons/icon.css';
import '@/assets/fonts/ERPyb/ERPyb.css';
import '@/assets/fonts/pinar/pinar.css';
import '@/assets/fonts/gofteh/gofteh.css';
import '@/assets/fonts/potk/potk.css';
import 'plyr/dist/plyr.css';
import 'rsuite/dist/rsuite-no-reset-rtl.min.css';

//Providers
import ReduxProvider from 'providers/ReduxProvider';
import ReactQueryProvider from 'providers/ReactQueryProvider';

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
          <ReactQueryProvider>{children}</ReactQueryProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
