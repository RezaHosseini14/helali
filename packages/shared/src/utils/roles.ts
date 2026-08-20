import { ROLE_NAME_VALUES, ROLE_NAMES } from '../constants';

const ADMIN_ROLES = new Set<string>([ROLE_NAMES.SUPER, ROLE_NAMES.ADMIN]);

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.has(role);
}

export function isSuperRole(role: string): boolean {
  return role === ROLE_NAMES.SUPER;
}

export function isSystemRole(name: string): boolean {
  return (ROLE_NAME_VALUES as ReadonlyArray<string>).includes(name);
}

export function normalizeRoleName(name: string): string {
  return name.trim().toUpperCase().replace(/[\s-]+/g, '_');
}
