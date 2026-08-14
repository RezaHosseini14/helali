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
    children: [
      {
        title: 'لیست کاربران',
        url: '/dashboard/user',
        icon: 'solar:users-group-two-rounded-bold-duotone',
      },
    ],
  },
  {
    title: 'صوت',
    url: '/',
    icon: 'solar:music-note-bold-duotone',
    children: [
      {
        title: 'لیست صوت‌ها',
        url: '/dashboard/audio',
        icon: 'solar:music-notes-bold-duotone',
      },
    ],
  },
  {
    title: 'ویدیو',
    url: '/',
    icon: 'solar:videocamera-record-bold-duotone',
    children: [
      {
        title: 'لیست ویدیوها',
        url: '/dashboard/video',
        icon: 'solar:videocamera-record-bold-duotone',
      },
    ],
  },
  {
    title: 'تصاویر',
    url: '/gallery',
    icon: 'solar:gallery-minimalistic-bold-duotone',
    children: [
      {
        title: 'لیست تصاویر',
        url: '/dashboard/gallery',
        icon: 'solar:gallery-minimalistic-bold-duotone',
      },
    ],
  },
  {
    title: 'دسته‌بندی',
    url: '/category',
    icon: 'solar:library-bold-duotone',
    children: [
      {
        title: 'لیست دسته‌بندی‌ها',
        url: '/dashboard/category',
        icon: 'solar:library-bold-duotone',
      },
    ],
  },
  {
    title: 'نظرات',
    url: '/comment',
    icon: 'solar:chat-line-bold-duotone',
    children: [
      {
        title: 'لیست نظرات',
        url: '/dashboard/comment',
        icon: 'solar:chat-line-bold-duotone',
      },
    ],
  },
];
