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
    icon: 'solar:users-group-two-rounded-bold-duotone',
    // icon: 'user',
    children: [
      {
        title: 'لیست کاربران',
        url: '/dashboard/user',
        icon: 'solar:users-group-two-rounded-bold-duotone',
        // icon: 'people',
      },
      {
        title: 'ایجاد کاربر',
        url: '/dashboard/user/create',
        icon: 'solar:user-plus-rounded-bold-duotone',
        // icon: 'user-tick',
      },
    ],
  },
  {
    title: 'صوت',
    url: '/',
    icon: 'solar:music-note-bold-duotone',
    // icon: 'abstract-45',
    children: [
      {
        title: 'لیست صوت',
        url: '/dashboard/audio',
        icon: 'solar:music-notes-bold-duotone',
        // icon: 'abstract-45',
      },
      {
        title: 'ایجاد صوت',
        url: '/dashboard/audio/create',
        icon: 'solar:music-note-bold-duotone',
        // icon: 'plus-square',
      },
    ],
  },
  {
    title: 'ویدیو',
    url: '/',
    icon: 'solar:videocamera-record-bold-duotone',
    // icon: 'abstract-31',
    children: [
      {
        title: 'لیست ویدیو',
        url: '/dashboard/video',
        icon: 'solar:videocamera-record-bold-duotone',
        // icon: 'abstract-31',
      },
      {
        title: 'ایجاد ویدیو',
        url: '/dashboard/video/create',
        icon: 'solar:videocamera-add-bold-duotone',
        // icon: 'plus-square',
      },
    ],
  },
  {
    title: 'گالری',
    url: '/gallery',
    icon: 'solar:gallery-minimalistic-bold-duotone',
    // icon: 'picture',
    children: [
      {
        title: 'لیست تصاویر',
        url: '/dashboard/gallery',
        icon: 'solar:gallery-minimalistic-bold-duotone',
        // icon: 'picture',
      },
      {
        title: 'ایجاد تصویر',
        url: '/dashboard/gallery/create',
        icon: 'solar:gallery-add-bold-duotone',
        // icon: 'plus-square',
      },
    ],
  },
  {
    title: 'دسته‌بندی',
    url: '/category',
    icon: 'solar:library-bold-duotone',
    // icon: 'lots-shopping',
    children: [
      {
        title: 'لیست دسته‌بندی',
        url: '/dashboard/category',
        icon: 'solar:library-bold-duotone',
        // icon: 'lots-shopping',
      },
    ],
  },
  {
    title: 'نظرات',
    url: '/comment',
    icon: 'solar:chat-line-bold-duotone',
    // icon: 'messages',
    children: [
      {
        title: 'لیست نظرات',
        url: '/dashboard/comment',
        icon: 'solar:chat-line-bold-duotone',
        // icon: 'messages',
      },
    ],
  },
];
