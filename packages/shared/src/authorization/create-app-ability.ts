import { AbilityBuilder, createMongoAbility } from '@casl/ability';

import { ROLE_NAMES } from '../constants';
import { isAdminRole } from '../utils/roles';

import { PERMISSION_RULES } from './permission-rules';

import type { AppAbility, IAbilityUser } from './types';

function normalizeAbilityUser(user: IAbilityUser | string): Required<IAbilityUser> {
  if (typeof user === 'string') {
    return {
      id: 0,
      role: user,
      permissions: [],
    };
  }

  return {
    id: user.id,
    role: user.role,
    permissions: [...(user.permissions ?? [])],
  };
}

export function createAppAbility(user: IAbilityUser | string): AppAbility {
  const normalizedUser = normalizeAbilityUser(user);
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  if (normalizedUser.role === ROLE_NAMES.SUPER) {
    can('manage', 'all');
    return build();
  }

  const hasUserUpdatePermission = normalizedUser.permissions.includes('user.update');
  const hasUserManagePermission = normalizedUser.permissions.includes('user.manage');

  for (const permission of normalizedUser.permissions) {
    const rules = PERMISSION_RULES[permission];

    if (!rules) {
      continue;
    }

    for (const rule of rules) {
      can(rule.action, rule.subject);
    }
  }

  if (!hasUserUpdatePermission && !hasUserManagePermission) {
    if (isAdminRole(normalizedUser.role)) {
      can('update', 'User');
    } else {
      can('update', 'User', { id: normalizedUser.id });
    }
  }

  return build();
}
