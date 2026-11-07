export const APP_VERSION = '0.1.0';

export type ChangelogSectionKey = 'added' | 'changed' | 'fixed' | 'removed' | 'security';

export const CHANGELOG_SECTION_LABELS: Record<ChangelogSectionKey, string> = {
  added: 'افزوده‌شده',
  changed: 'بهبود و تغییر',
  fixed: 'رفع اشکال',
  removed: 'حذف‌شده',
  security: 'امنیت',
};

export const CHANGELOG_SECTION_ORDER: ChangelogSectionKey[] = [
  'added',
  'changed',
  'fixed',
  'removed',
  'security',
];

export interface IChangelogEntry {
  version: string;
  date: string;
  title: string;
  added?: string[];
  changed?: string[];
  fixed?: string[];
  removed?: string[];
  security?: string[];
}

export const CHANGELOG: IChangelogEntry[] = [
  {
    version: '0.1.0',
    date: '2026-10-18',
    title: 'نسخه اولیه',
    added: [
      'راه‌اندازی پنل مدیریت و سایت پایگاه حفظ و نشر آثار',
      'نمایش شماره نسخه در سایدبار داشبورد',
      'فهرست تغییرات نسخه از منوی حساب کاربری',
      'مودال تغییرات با دسته‌بندی افزوده‌شده، بهبود، رفع اشکال و امنیت',
      'باز کردن مودال با کلیک روی شماره نسخه در سایدبار',
    ],
  },
];
