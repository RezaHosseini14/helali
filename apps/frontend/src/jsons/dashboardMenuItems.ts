export type dashboardMenuItemsType = {
  title: string;
  url: string;
  icon: string;
  subject?:
    | 'Audio'
    | 'Video'
    | 'Gallery'
    | 'Category'
    | 'Comment'
    | 'Tweet'
    | 'User'
    | 'AuditLog'
    | 'Dashboard';
  action?: 'read' | 'manage' | 'manageRoles';
  children?: dashboardMenuItemsType[];
};

export const dashboardMenuItems: dashboardMenuItemsType[] = [
  {
    title: 'کاربران',
    url: '/user',
    icon: 'solar:users-group-two-rounded-bold-duotone',
    subject: 'User',
    action: 'read',
    children: [
      {
        title: 'لیست کاربران',
        url: '/dashboard/user',
        icon: 'solar:users-group-two-rounded-bold-duotone',
        subject: 'User',
        action: 'read',
      },
      {
        title: 'نقش‌ها و دسترسی‌ها',
        url: '/dashboard/roles',
        icon: 'solar:shield-user-bold-duotone',
        subject: 'User',
        action: 'manageRoles',
      },
    ],
  },
  {
    title: 'صوت',
    url: '/',
    icon: 'solar:music-note-bold-duotone',
    subject: 'Audio',
    action: 'read',
    children: [
      {
        title: 'لیست صوت‌ها',
        url: '/dashboard/audio',
        icon: 'solar:music-notes-bold-duotone',
        subject: 'Audio',
        action: 'read',
      },
    ],
  },
  {
    title: 'ویدیو',
    url: '/',
    icon: 'solar:videocamera-record-bold-duotone',
    subject: 'Video',
    action: 'read',
    children: [
      {
        title: 'لیست ویدیوها',
        url: '/dashboard/video',
        icon: 'solar:videocamera-record-bold-duotone',
        subject: 'Video',
        action: 'read',
      },
    ],
  },
  {
    title: 'تصاویر',
    url: '/gallery',
    icon: 'solar:gallery-minimalistic-bold-duotone',
    subject: 'Gallery',
    action: 'read',
    children: [
      {
        title: 'لیست تصاویر',
        url: '/dashboard/gallery',
        icon: 'solar:gallery-minimalistic-bold-duotone',
        subject: 'Gallery',
        action: 'read',
      },
    ],
  },
  {
    title: 'دسته‌بندی',
    url: '/category',
    icon: 'solar:library-bold-duotone',
    subject: 'Category',
    action: 'manage',
    children: [
      {
        title: 'لیست دسته‌بندی‌ها',
        url: '/dashboard/category',
        icon: 'solar:library-bold-duotone',
        subject: 'Category',
        action: 'manage',
      },
    ],
  },
  {
    title: 'نظرات',
    url: '/comment',
    icon: 'solar:chat-line-bold-duotone',
    subject: 'Comment',
    action: 'manage',
    children: [
      {
        title: 'لیست نظرات',
        url: '/dashboard/comment',
        icon: 'solar:chat-line-bold-duotone',
        subject: 'Comment',
        action: 'manage',
      },
    ],
  },
  {
    title: 'توییت‌ها',
    url: '/tweets',
    icon: 'hugeicons:new-twitter',
    subject: 'Tweet',
    action: 'read',
    children: [
      {
        title: 'مدیریت توییت‌ها',
        url: '/dashboard/tweets',
        icon: 'hugeicons:new-twitter',
        subject: 'Tweet',
        action: 'read',
      },
    ],
  },
  {
    title: 'لاگ ممیزی',
    url: '/audit-logs',
    icon: 'solar:clipboard-list-bold-duotone',
    subject: 'AuditLog',
    action: 'read',
    children: [
      {
        title: 'لاگ‌های ممیزی',
        url: '/dashboard/audit-logs',
        icon: 'solar:clipboard-list-bold-duotone',
        subject: 'AuditLog',
        action: 'read',
      },
    ],
  },
];
