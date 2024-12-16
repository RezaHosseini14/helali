'use client';

import { dashboardMenuItems, dashboardMenuItemsType } from '@/jsons/dashboardMenuItems';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Breadcrumb } from 'rsuite';

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
    <Breadcrumb className='mb-0' separator={'>'}>
      <Breadcrumb.Item as={Link} href="/">
        داشبورد
      </Breadcrumb.Item>

      {pathSegments.map((_, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const title = findTitleByUrl(dashboardMenuItems, href);

        if (!title) {
          console.warn(`عنوانی برای مسیر ${href} پیدا نشد.`);
          return null;
        }

        return index === pathSegments.length - 1 ? (
          <Breadcrumb.Item key={index} active>
            {title}
          </Breadcrumb.Item>
        ) : (
          <Breadcrumb.Item key={index} as={Link} href={href}>
            {title}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
}

export default MyBreadcrumb;
