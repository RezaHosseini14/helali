import type { IPermission } from '@helali/shared';

const ROLE_LABELS: Record<string, string> = {
  SUPER: 'مدیر ارشد',
  ADMIN: 'مدیر',
  USER: 'کاربر',
  ADMIN_AUDIO: 'مدیر صوت',
};

const PERMISSION_GROUP_LABELS: Record<string, string> = {
  audio: 'صوت',
  video: 'ویدیو',
  gallery: 'گالری',
  category: 'دسته‌بندی',
  comment: 'نظرات',
  tweet: 'توییت',
  user: 'کاربران',
  dashboard: 'داشبورد',
  audit: 'ممیزی',
};

const PERMISSION_ACTION_LABELS: Record<string, string> = {
  read: 'مشاهده',
  create: 'ایجاد',
  update: 'ویرایش',
  delete: 'حذف',
  manage: 'مدیریت کامل',
  'manage-roles': 'مدیریت نقش‌ها',
};

export function getRoleLabel(roleName: string): string {
  return ROLE_LABELS[roleName] ?? roleName;
}

export function getPermissionGroupLabel(groupKey: string): string {
  return PERMISSION_GROUP_LABELS[groupKey] ?? groupKey;
}

export function getPermissionLabel(permissionName: string): string {
  const [group, action] = permissionName.split('.');
  const groupLabel = getPermissionGroupLabel(group ?? '');
  const actionLabel = PERMISSION_ACTION_LABELS[action ?? ''] ?? action;
  return `${actionLabel} ${groupLabel}`;
}

export function getPermissionSearchText(permission: IPermission): string {
  return [permission.name, getPermissionLabel(permission.name), permission.description]
    .join(' ')
    .toLowerCase();
}

export function groupPermissions(permissions: ReadonlyArray<IPermission>) {
  const groups = new Map<string, IPermission[]>();

  for (const permission of permissions) {
    const groupKey = permission.name.split('.')[0] ?? 'other';
    const existing = groups.get(groupKey) ?? [];
    existing.push(permission);
    groups.set(groupKey, existing);
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}
