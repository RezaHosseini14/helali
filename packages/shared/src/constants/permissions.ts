export const PERMISSIONS = {
  AUDIO_READ: 'audio.read',
  AUDIO_CREATE: 'audio.create',
  AUDIO_UPDATE: 'audio.update',
  AUDIO_DELETE: 'audio.delete',
  VIDEO_READ: 'video.read',
  VIDEO_CREATE: 'video.create',
  VIDEO_UPDATE: 'video.update',
  VIDEO_DELETE: 'video.delete',
  GALLERY_READ: 'gallery.read',
  GALLERY_CREATE: 'gallery.create',
  GALLERY_UPDATE: 'gallery.update',
  GALLERY_DELETE: 'gallery.delete',
  CATEGORY_MANAGE: 'category.manage',
  COMMENT_MANAGE: 'comment.manage',
  TWEET_READ: 'tweet.read',
  TWEET_CREATE: 'tweet.create',
  TWEET_UPDATE: 'tweet.update',
  TWEET_DELETE: 'tweet.delete',
  USER_READ: 'user.read',
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_MANAGE: 'user.manage',
  USER_MANAGE_ROLES: 'user.manage-roles',
  DASHBOARD_READ: 'dashboard.read',
  AUDIT_READ: 'audit.read',
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_NAME_VALUES = Object.values(PERMISSIONS);

export const ALL_PERMISSIONS = PERMISSION_NAME_VALUES;
