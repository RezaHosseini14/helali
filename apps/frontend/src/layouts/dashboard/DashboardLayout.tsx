'use client';

import type { ReactNode } from 'react';
import { useSelector } from 'react-redux';

import Header from '@/components/layouts/dashboard/Header';
import Sidebar from '@/components/layouts/dashboard/Sidebar';
import type { RootState } from '@/redux/store';

function DashboardLayout({ children }: { children: ReactNode }) {
  const { sidebarStatus } = useSelector((state: RootState) => state.style);

  return (
    <div className="flex gap-8 p-8 h-screen relative">
      <Sidebar />
      <div
        className={`flex min-w-0 flex-1 flex-col gap-8 overflow-x-hidden transition-[margin] duration-300 ease-in-out ${sidebarStatus ? 'ms-[20rem]' : 'ms-24'}`}
      >
        <Header />
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
