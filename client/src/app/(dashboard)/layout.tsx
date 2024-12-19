import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import '@/assets/css/dashboard.css';

const RsuiteProviderDashboard = dynamic(() => import('providers/RsuiteProviderDashboard'), { ssr: false });
const FadeProvider = dynamic(() => import('providers/FadeProvider'), { ssr: false });
const ThemeProvider = dynamic(() => import('providers/ThemeProvider'), { ssr: false });

export const metadata: Metadata = {
  title: 'داشبورد',
  description: 'توضیحات داشبورد',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="dashboard dark:bg-dashboardbackground bg-mainbackground">
        <RsuiteProviderDashboard>
          <ThemeProvider>
            <DashboardLayout>
              <FadeProvider>{children}</FadeProvider>
            </DashboardLayout>
          </ThemeProvider>
        </RsuiteProviderDashboard>
      </body>
    </html>
  );
}
