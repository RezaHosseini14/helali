export type MenuItemsType = {
  title: string;
  url: string;
  icon: string;
};

export const menuItems: MenuItemsType[] = [
  {
    title: 'صفحه نخست',
    url: '/',
    icon: 'solar:home-2-bold-duotone',
  },
  {
    title: 'ویدیوها',
    url: '/video',
    icon: 'solar:videocamera-record-bold-duotone',
  },
  {
    title: 'صوت‌ها',
    url: '/audio',
    icon: 'solar:music-note-bold-duotone',
  },
  {
    title: 'کاربر',
    url: '/dashboard',
    icon: 'solar:user-bold-duotone',
  },
];
