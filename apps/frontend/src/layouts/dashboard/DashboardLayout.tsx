'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Header from '@/components/layouts/dashboard/Header';
import Sidebar from '@/components/layouts/dashboard/Sidebar';
import { cn } from '@/lib/utils';
import { SET_SIDEBAR } from '@/redux/slices/styleSlice';
import type { RootState } from '@/redux/store';

function DashboardLayout({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const { sidebarStatus } = useSelector((state: RootState) => state.style);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');

    const syncSidebarForViewport = () => {
      if (mediaQuery.matches) {
        dispatch(SET_SIDEBAR(false));
      }
    };

    syncSidebarForViewport();
    mediaQuery.addEventListener('change', syncSidebarForViewport);

    return () => {
      mediaQuery.removeEventListener('change', syncSidebarForViewport);
    };
  }, [dispatch]);

  return (
    <div className="relative flex h-dvh flex-col p-3 sm:p-5 lg:p-8">
      {sidebarStatus ? (
        <button
          type="button"
          aria-label="بستن منو"
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[1px] lg:hidden"
          onClick={() => {
            dispatch(SET_SIDEBAR(false));
          }}
        />
      ) : null}

      <Sidebar />

      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto transition-[margin] duration-300 ease-in-out sm:gap-6 lg:gap-8',
          sidebarStatus ? 'lg:ms-80' : 'lg:ms-24',
        )}
      >
        <Header />
        <div className="min-w-0 flex-1 pb-2">{children}</div>
      </div>
    </div>
  );
}

export default DashboardLayout;
