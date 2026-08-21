'use client';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { AppAbility } from '@helali/shared';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAppAbility } from '@/features/auth/context/ability-provider';
import {
  dashboardMenuItems,
  type dashboardMenuItemsType,
} from '@/jsons/dashboardMenuItems';
import { cn } from '@/lib/utils';
import { SET_SIDEBAR } from '@/redux/slices/styleSlice';
import type { RootState } from '@/redux/store';

const EXPANDED_MENU_KEY = 'helali.dashboard.expandedMenu';
const MOBILE_SIDEBAR_QUERY = '(max-width: 1023px)';

function canAccessMenuItem(ability: AppAbility, item: dashboardMenuItemsType): boolean {
  if (!item.subject || !item.action) {
    return true;
  }

  return ability.can(item.action, item.subject);
}

function filterMenuItems(
  ability: AppAbility,
  items: ReadonlyArray<dashboardMenuItemsType>,
): dashboardMenuItemsType[] {
  const filtered: dashboardMenuItemsType[] = [];

  for (const item of items) {
    const children = item.children
      ? filterMenuItems(ability, item.children)
      : undefined;

    if (children && children.length === 0) {
      continue;
    }

    if (!canAccessMenuItem(ability, item) && (!children || children.length === 0)) {
      continue;
    }

    filtered.push(
      children
        ? {
            ...item,
            children,
          }
        : {
            ...item,
            children: undefined,
          },
    );
  }

  return filtered;
}

function isPathMatch(pathname: string, url: string): boolean {
  return pathname === url || pathname.startsWith(`${url}/`);
}

function findActiveMenu(
  pathname: string,
  items: ReadonlyArray<dashboardMenuItemsType>,
): {
  parentIndex: number;
  childUrl: string | null;
} {
  let bestParentIndex = -1;
  let bestChildUrl: string | null = null;
  let bestLength = -1;

  items.forEach((item, parentIndex) => {
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

function readExpandedMenuIndex(itemCount: number): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  const raw = localStorage.getItem(EXPANDED_MENU_KEY);
  const parsed = raw ? Number.parseInt(raw, 10) : 0;

  if (Number.isNaN(parsed) || parsed < 0 || parsed >= itemCount) {
    return 0;
  }

  return parsed;
}

function Sidebar() {
  const ability = useAppAbility();
  const dispatch = useDispatch();
  const { sidebarStatus } = useSelector((state: RootState) => state.style);
  const pathname = usePathname();

  const visibleMenuItems = useMemo(
    () => filterMenuItems(ability, dashboardMenuItems),
    [ability],
  );

  const { childUrl: activeChildUrl } = useMemo(
    () => findActiveMenu(pathname, visibleMenuItems),
    [pathname, visibleMenuItems],
  );

  const [expandedMenuIndex, setExpandedMenuIndex] = useState(() => {
    const { parentIndex } = findActiveMenu(pathname, visibleMenuItems);
    return parentIndex >= 0 ? parentIndex : 0;
  });

  useEffect(() => {
    const { parentIndex } = findActiveMenu(pathname, visibleMenuItems);

    if (parentIndex >= 0) {
      setExpandedMenuIndex(parentIndex);
      localStorage.setItem(EXPANDED_MENU_KEY, parentIndex.toString());
      return;
    }

    setExpandedMenuIndex(readExpandedMenuIndex(visibleMenuItems.length));
  }, [pathname, visibleMenuItems]);

  const handleShowChildren = (index: number) => {
    setExpandedMenuIndex(index);
    localStorage.setItem(EXPANDED_MENU_KEY, index.toString());
  };

  const handleNavigate = () => {
    if (typeof window !== 'undefined' && window.matchMedia(MOBILE_SIDEBAR_QUERY).matches) {
      dispatch(SET_SIDEBAR(false));
    }
  };

  const isExpanded = sidebarStatus;

  return (
    <aside
      className={cn(
        'fixed z-50 flex overflow-hidden border border-border bg-card text-foreground shadow-sm transition-[transform,width,inset] duration-300 ease-in-out',
        'start-0 top-0 bottom-0 w-[min(18rem,88vw)] rounded-none border-y-0 border-s-0 sm:rounded-e-2xl',
        'lg:start-8 lg:top-8 lg:bottom-8 lg:rounded-2xl lg:border',
        isExpanded ? 'lg:w-72' : 'lg:w-16',
        isExpanded
          ? 'translate-x-0'
          : 'pointer-events-none invisible -translate-x-full rtl:translate-x-full lg:pointer-events-auto lg:visible lg:translate-x-0',
      )}
    >
      <div
        className={cn(
          'flex w-16 shrink-0 flex-col items-center gap-6 transition-[padding] duration-300 ease-in-out',
          isExpanded ? 'py-8' : 'py-3 max-lg:py-8',
        )}
      >
        {visibleMenuItems.map((item, index) => {
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
          'min-w-0 flex-1 overflow-y-auto border-s border-border transition-[opacity,padding] duration-300 ease-in-out',
          isExpanded
            ? 'px-2 py-4 opacity-100'
            : 'pointer-events-none p-0 opacity-0 max-lg:pointer-events-none',
        )}
      >
        {visibleMenuItems[expandedMenuIndex]?.children ? (
          <motion.ul
            key={expandedMenuIndex}
            className="flex w-full min-w-0 flex-col gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <p className="mb-2 truncate border-b border-border px-2 pb-2 text-base font-bold text-foreground">
              {visibleMenuItems[expandedMenuIndex].title}
            </p>
            {visibleMenuItems[expandedMenuIndex].children?.map((child) => {
              const isChildActive = activeChildUrl === child.url;

              return (
                <li key={child.url} className="min-w-0">
                  <Link
                    href={child.url}
                    aria-current={isChildActive ? 'page' : undefined}
                    tabIndex={isExpanded ? undefined : -1}
                    onClick={handleNavigate}
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
    </aside>
  );
}

export default Sidebar;
