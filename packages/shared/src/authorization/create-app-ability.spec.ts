import { PERMISSIONS, ROLE_NAMES } from '../constants';

import { createAppAbility } from './create-app-ability';

import { subject } from '@casl/ability';

describe('createAppAbility', () => {
  it('grants mapped permissions from role permission strings', () => {
    const ability = createAppAbility({
      id: 1,
      role: ROLE_NAMES.ADMIN,
      permissions: [PERMISSIONS.AUDIO_READ, PERMISSIONS.AUDIO_CREATE],
    });

    expect(ability.can('read', 'Audio')).toBe(true);
    expect(ability.can('create', 'Audio')).toBe(true);
    expect(ability.can('delete', 'Audio')).toBe(false);
  });

  it('allows super admin to manage everything', () => {
    const ability = createAppAbility({
      id: 1,
      role: ROLE_NAMES.SUPER,
      permissions: [],
    });

    expect(ability.can('manage', 'all')).toBe(true);
    expect(ability.can('delete', 'User')).toBe(true);
  });

  it('allows admins to update any user without user.update permission', () => {
    const ability = createAppAbility({
      id: 2,
      role: ROLE_NAMES.ADMIN,
      permissions: [PERMISSIONS.USER_READ],
    });

    expect(ability.can('update', 'User')).toBe(true);
    expect(ability.can('update', subject('User', { id: 99 }))).toBe(true);
  });

  it('allows self-update for regular users without user.update permission', () => {
    const ability = createAppAbility({
      id: 5,
      role: ROLE_NAMES.USER,
      permissions: [PERMISSIONS.AUDIO_READ],
    });

    expect(ability.can('update', subject('User', { id: 5 }))).toBe(true);
    expect(ability.can('update', subject('User', { id: 99 }))).toBe(false);
  });

  it('allows user.update permission to update any user', () => {
    const ability = createAppAbility({
      id: 3,
      role: ROLE_NAMES.ADMIN,
      permissions: [PERMISSIONS.USER_UPDATE],
    });

    expect(ability.can('update', subject('User', { id: 99 }))).toBe(true);
  });

  it('grants user.manage only with user.manage permission', () => {
    const ability = createAppAbility({
      id: 1,
      role: ROLE_NAMES.ADMIN,
      permissions: [PERMISSIONS.USER_MANAGE],
    });

    expect(ability.can('manage', 'User')).toBe(true);
  });

  it('derives permissions from role when not provided', () => {
    const ability = createAppAbility({
      id: 1,
      role: ROLE_NAMES.ADMIN,
    });

    expect(ability.can('create', 'Audio')).toBe(true);
    expect(ability.can('read', 'Dashboard')).toBe(true);
    expect(ability.can('manage', 'User')).toBe(false);
  });
});
