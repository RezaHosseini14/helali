export const APP_VERSION = '0.1.0';

export interface IChangelogEntry {
  version: string;
  date: string;
  title: string;
  items: string[];
}

export const CHANGELOG: IChangelogEntry[] = [
  {
    version: '0.1.0',
    date: '2026-10-18',
    title: 'نسخه اولیه',
    items: [
      'راه‌اندازی پنل مدیریت و سایت پایگاه حفظ و نشر آثار',
      'نمایش شماره نسخه در سایدبار داشبورد',
      'فهرست تغییرات نسخه از منوی حساب کاربری',
    ],
  },
];
