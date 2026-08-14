import type { AppActions, AppSubjects } from './types';

export const PERMISSION_RULES: Record<
  string,
  ReadonlyArray<{ action: AppActions; subject: AppSubjects }>
> = {
  'audio.read': [{ action: 'read', subject: 'Audio' }],
  'audio.create': [{ action: 'create', subject: 'Audio' }],
  'audio.update': [{ action: 'update', subject: 'Audio' }],
  'audio.delete': [{ action: 'delete', subject: 'Audio' }],
  'video.read': [{ action: 'read', subject: 'Video' }],
  'video.create': [{ action: 'create', subject: 'Video' }],
  'video.update': [{ action: 'update', subject: 'Video' }],
  'video.delete': [{ action: 'delete', subject: 'Video' }],
  'gallery.read': [{ action: 'read', subject: 'Gallery' }],
  'gallery.create': [{ action: 'create', subject: 'Gallery' }],
  'gallery.update': [{ action: 'update', subject: 'Gallery' }],
  'gallery.delete': [{ action: 'delete', subject: 'Gallery' }],
  'category.manage': [{ action: 'manage', subject: 'Category' }],
  'comment.manage': [{ action: 'manage', subject: 'Comment' }],
  'user.read': [{ action: 'read', subject: 'User' }],
  'user.update': [{ action: 'update', subject: 'User' }],
  'user.manage': [{ action: 'manage', subject: 'User' }],
  'dashboard.read': [{ action: 'read', subject: 'Dashboard' }],
  'audit.read': [{ action: 'read', subject: 'AuditLog' }],
};
