import type { Metadata } from 'next';

// Css
import '@/assets/css/dashboard.css';

// Providers
import RsuiteProviderDashboard from 'providers/RsuiteProviderDashboard';
import ThemeProvider from 'providers/ThemeProvider';
import FadeProvider from 'providers/FadeProvider';

// Layouts
import DashboardLayout from '@/layouts/dashboard/DashboardLayout';

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
