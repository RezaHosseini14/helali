'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { dashboardMenuItems, type dashboardMenuItemsType } from '@/jsons/dashboardMenuItems';

function findTitleByUrl(items: dashboardMenuItemsType[], url: string): string | undefined {
  for (const item of items) {
    if (item.url === url) {
      return item.title;
    }

    if (item.children) {
      const foundTitle = findTitleByUrl(item.children, url);
      if (foundTitle) {
        return foundTitle;
      }
    }
  }
  return undefined;
}

function MyBreadcrumb() {
  const currentPath = usePathname();
  const pathSegments = currentPath.split('/').filter(Boolean);

  return (
    <Breadcrumb className="mb-0">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/" />}>داشبورد</BreadcrumbLink>
        </BreadcrumbItem>

        {pathSegments.map((_, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const title = findTitleByUrl(dashboardMenuItems, href);

          if (!title) {
            return null;
          }

          const isLast = index === pathSegments.length - 1;

          return (
            <div key={href} className="contents">
              <BreadcrumbSeparator>{'>'}</BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={href} />}>{title}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default MyBreadcrumb;
