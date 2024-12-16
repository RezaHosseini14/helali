import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import type { Metadata } from 'next';
import ThemeProvider from 'providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'داشبورد',
  description: 'توضیحات داشبورد',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <ThemeProvider>
          <DashboardLayout>{children}</DashboardLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
