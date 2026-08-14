'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { dashboardMenuItems } from '@/jsons/dashboardMenuItems';
import { cn } from '@/lib/utils';
import type { RootState } from '@/redux/store';

const EXPANDED_MENU_KEY = 'helali.dashboard.expandedMenu';

function isPathMatch(pathname: string, url: string): boolean {
  return pathname === url || pathname.startsWith(`${url}/`);
}

function findActiveMenu(pathname: string): {
  parentIndex: number;
  childUrl: string | null;
} {
  let bestParentIndex = -1;
  let bestChildUrl: string | null = null;
  let bestLength = -1;

  dashboardMenuItems.forEach((item, parentIndex) => {
    item.children?.forEach((child) => {
      if (!isPathMatch(pathname, child.url)) {
        return;
      }

      if (child.url.length > bestLength) {
        bestLength = child.url.length;
        bestParentIndex = parentIndex;
        bestChildUrl = child.url;
      }
    });
  });

  return { parentIndex: bestParentIndex, childUrl: bestChildUrl };
}

function readExpandedMenuIndex(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  const raw = localStorage.getItem(EXPANDED_MENU_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : 0;

  if (Number.isNaN(parsed) || parsed < 0 || parsed >= dashboardMenuItems.length) {
    return 0;
  }

  return parsed;
}

function Sidebar() {
  const { sidebarStatus } = useSelector((state: RootState) => state.style);
  const pathname = usePathname();
  const { childUrl: activeChildUrl } = useMemo(() => findActiveMenu(pathname), [pathname]);

  const [expandedMenuIndex, setExpandedMenuIndex] = useState(() => {
    const { parentIndex } = findActiveMenu(pathname);
    return parentIndex >= 0 ? parentIndex : readExpandedMenuIndex();
  });

  useEffect(() => {
    const { parentIndex } = findActiveMenu(pathname);

    if (parentIndex >= 0) {
      setExpandedMenuIndex(parentIndex);
      localStorage.setItem(EXPANDED_MENU_KEY, parentIndex.toString());
      return;
    }

    setExpandedMenuIndex(readExpandedMenuIndex());
  }, [pathname]);

  const handleShowChildren = (index: number) => {
    setExpandedMenuIndex(index);
    localStorage.setItem(EXPANDED_MENU_KEY, index.toString());
  };

  return (
    <div
      className={cn(
        'fixed start-8 top-8 bottom-8 flex overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-sm transition-[width] duration-300 ease-in-out',
        sidebarStatus ? 'w-72' : 'w-16',
      )}
    >
      <div
        className={cn(
          'flex w-16 shrink-0 flex-col items-center gap-6 transition-[padding] duration-300 ease-in-out',
          sidebarStatus ? 'py-8' : 'py-3',
        )}
      >
        {dashboardMenuItems.map((item, index) => {
          const isActive = expandedMenuIndex === index;

          return (
            <Tooltip key={item.title}>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={() => handleShowChildren(index)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'grid size-12 place-content-center rounded-2xl transition-all',
                      isActive
                        ? 'bg-mainstructure text-white shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  />
                }
              >
                <Icon
                  icon={item.icon}
                  className={cn('size-7', isActive ? 'text-white' : 'text-muted-foreground')}
                />
              </TooltipTrigger>
              <TooltipContent side="right">{item.title}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <div
        className={cn(
          'min-w-0 flex-1 overflow-hidden border-s border-border transition-[opacity,padding] duration-300 ease-in-out',
          sidebarStatus ? 'px-2 py-4 opacity-100' : 'pointer-events-none p-0 opacity-0',
        )}
      >
        {dashboardMenuItems[expandedMenuIndex]?.children ? (
          <motion.ul
            key={expandedMenuIndex}
            className="flex w-full min-w-0 flex-col gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <p className="mb-2 truncate border-b border-border px-2 pb-2 text-base font-bold text-foreground">
              {dashboardMenuItems[expandedMenuIndex].title}
            </p>
            {dashboardMenuItems[expandedMenuIndex].children?.map((child) => {
              const isChildActive = activeChildUrl === child.url;

              return (
                <li key={child.url} className="min-w-0">
                  <Link
                    href={child.url}
                    aria-current={isChildActive ? 'page' : undefined}
                    tabIndex={sidebarStatus ? undefined : -1}
                    className={cn(
                      'flex min-w-0 items-center gap-2 rounded-xl px-2 py-2 transition-colors',
                      isChildActive
                        ? 'bg-mainstructure text-white shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon
                      icon={child.icon}
                      className={cn(
                        'size-5 shrink-0',
                        isChildActive ? 'text-white' : 'text-muted-foreground',
                      )}
                    />
                    <span className="min-w-0 truncate text-sm font-medium">{child.title}</span>
                  </Link>
                </li>
              );
            })}
          </motion.ul>
        ) : (
          <p className="px-2 text-sm text-muted-foreground">زیرمنویی موجود نیست</p>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
