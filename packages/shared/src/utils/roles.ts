import { ROLE_NAMES } from '../constants';

const ADMIN_ROLES = new Set<string>([ROLE_NAMES.SUPER, ROLE_NAMES.ADMIN]);

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.has(role);
}

export function isSuperRole(role: string): boolean {
  return role === ROLE_NAMES.SUPER;
}
