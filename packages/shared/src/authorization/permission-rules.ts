import { PERMISSIONS } from '../constants';

import type { AppActions, AppSubjects } from './types';

export interface IPermissionRule {
  readonly action: AppActions;
  readonly subject: AppSubjects;
}

export const PERMISSION_RULES: Record<string, ReadonlyArray<IPermissionRule>> = {
  [PERMISSIONS.AUDIO_READ]: [{ action: 'read', subject: 'Audio' }],
  [PERMISSIONS.AUDIO_CREATE]: [{ action: 'create', subject: 'Audio' }],
  [PERMISSIONS.AUDIO_UPDATE]: [{ action: 'update', subject: 'Audio' }],
  [PERMISSIONS.AUDIO_DELETE]: [{ action: 'delete', subject: 'Audio' }],
  [PERMISSIONS.VIDEO_READ]: [{ action: 'read', subject: 'Video' }],
  [PERMISSIONS.VIDEO_CREATE]: [{ action: 'create', subject: 'Video' }],
  [PERMISSIONS.VIDEO_UPDATE]: [{ action: 'update', subject: 'Video' }],
  [PERMISSIONS.VIDEO_DELETE]: [{ action: 'delete', subject: 'Video' }],
  [PERMISSIONS.GALLERY_READ]: [{ action: 'read', subject: 'Gallery' }],
  [PERMISSIONS.GALLERY_CREATE]: [{ action: 'create', subject: 'Gallery' }],
  [PERMISSIONS.GALLERY_UPDATE]: [{ action: 'update', subject: 'Gallery' }],
  [PERMISSIONS.GALLERY_DELETE]: [{ action: 'delete', subject: 'Gallery' }],
  [PERMISSIONS.CATEGORY_MANAGE]: [{ action: 'manage', subject: 'Category' }],
  [PERMISSIONS.COMMENT_MANAGE]: [{ action: 'manage', subject: 'Comment' }],
  [PERMISSIONS.TWEET_READ]: [{ action: 'read', subject: 'Tweet' }],
  [PERMISSIONS.TWEET_CREATE]: [{ action: 'create', subject: 'Tweet' }],
  [PERMISSIONS.TWEET_UPDATE]: [{ action: 'update', subject: 'Tweet' }],
  [PERMISSIONS.TWEET_DELETE]: [{ action: 'delete', subject: 'Tweet' }],
  [PERMISSIONS.USER_READ]: [{ action: 'read', subject: 'User' }],
  [PERMISSIONS.USER_CREATE]: [{ action: 'create', subject: 'User' }],
  [PERMISSIONS.USER_UPDATE]: [{ action: 'update', subject: 'User' }],
  [PERMISSIONS.USER_DELETE]: [{ action: 'delete', subject: 'User' }],
  [PERMISSIONS.USER_MANAGE]: [{ action: 'manage', subject: 'User' }],
  [PERMISSIONS.USER_MANAGE_ROLES]: [{ action: 'manageRoles', subject: 'User' }],
  [PERMISSIONS.DASHBOARD_READ]: [{ action: 'read', subject: 'Dashboard' }],
  [PERMISSIONS.AUDIT_READ]: [{ action: 'read', subject: 'AuditLog' }],
};
