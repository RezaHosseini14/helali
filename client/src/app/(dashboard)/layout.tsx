import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import ThemeProvider from 'providers/ThemeProvider';
import '@/assets/css/dashboard.css';

const RsuiteProviderDashboard = dynamic(() => import('providers/RsuiteProviderDashboard'), { ssr: false });

export const metadata: Metadata = {
  title: 'داشبورد',
  description: 'توضیحات داشبورد',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <RsuiteProviderDashboard>
          <ThemeProvider>
            <DashboardLayout>{children}</DashboardLayout>
          </ThemeProvider>
        </RsuiteProviderDashboard>
      </body>
    </html>
  );
}
