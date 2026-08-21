import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import DashboardLayout from '@/layouts/dashboard/DashboardLayout';
import { buildPageMetadata } from '@/lib/seo';
import FadeProvider from '@/src/providers/FadeProvider';
import UiProviderDashboard from '@/src/providers/UiProviderDashboard';

import '@/assets/css/dashboard.css';

export const metadata: Metadata = buildPageMetadata({
  title: 'پنل مدیریت',
  description: 'پنل مدیریت پایگاه هلالی',
  path: '/dashboard',
  noIndex: true,
});

interface IDashboardRouteLayoutProps {
  readonly children: ReactNode;
}

export default function DashboardRouteLayout({ children }: IDashboardRouteLayoutProps) {
  return (
    <div className="dashboard min-h-screen bg-background text-foreground">
      <UiProviderDashboard>
        <DashboardLayout>
          <FadeProvider>{children}</FadeProvider>
        </DashboardLayout>
      </UiProviderDashboard>
    </div>
  );
}
