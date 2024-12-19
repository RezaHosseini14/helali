export type dashboardMenuItemsType = {
  title: string;
  url: string;
  icon: string;
  children?: dashboardMenuItemsType[];
};

export const dashboardMenuItems: dashboardMenuItemsType[] = [
  {
    title: 'کاربران',
    url: '/user',
    icon: 'user',
    children: [
      {
        title: 'لیست کاربران',
        url: '/dashboard/user',
        icon: 'people',
      },
      {
        title: 'ایجاد کاربر',
        url: '/dashboard/user/create',
        icon: 'user-tick',
      },
    ],
  },
  {
    title: 'صوت',
    url: '/',
    icon: 'abstract-45',
    children: [
      {
        title: 'لیست صوت',
        url: '/dashboard/audio',
        icon: 'abstract-45',
      },
      {
        title: 'ایجاد صوت',
        url: '/dashboard/audio/create',
        icon: 'plus-square',
      },
    ],
  },
  {
    title: 'ویدیو',
    url: '/',
    icon: 'abstract-31',
    children: [
      {
        title: 'لیست ویدیو',
        url: '/dashboard/video',
        icon: 'abstract-31',
      },
      {
        title: 'ایجاد ویدیو',
        url: '/dashboard/video/create',
        icon: 'plus-square',
      },
    ],
  },
  {
    title: 'گالری',
    url: '/gallery',
    icon: 'picture',
    children: [
      {
        title: 'لیست تصاویر',
        url: '/dashboard/gallery',
        icon: 'picture',
      },
      {
        title: 'ایجاد تصویر',
        url: '/dashboard/gallery/create',
        icon: 'plus-square',
      },
    ],
  },
  {
    title: 'دسته‌بندی',
    url: '/category',
    icon: 'lots-shopping',
    children: [
      {
        title: 'لیست دسته‌بندی',
        url: '/dashboard/category',
        icon: 'lots-shopping',
      },
      {
        title: 'ایجاد دسته‌بندی',
        url: '/dashboard/category/create',
        icon: 'plus-square',
      },
    ],
  },
];
