import type { ForcedSubject, MongoAbility } from '@casl/ability';

export type AppActions =
  | 'manage'
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manageRoles';

export type AppSubjects =
  | 'Audio'
  | 'Video'
  | 'Gallery'
  | 'Category'
  | 'Comment'
  | 'Tweet'
  | 'User'
  | 'Dashboard'
  | 'AuditLog'
  | 'all';

export interface IUserSubject {
  readonly id: number;
}

export type UserSubject = IUserSubject & ForcedSubject<'User'>;

export type AppAbility = MongoAbility<[AppActions, AppSubjects | UserSubject]>;

export interface IAbilityUser {
  readonly id: number;
  readonly role: string;
  readonly permissions?: ReadonlyArray<string>;
}

export interface IAbilityRequirement {
  readonly action: AppActions;
  readonly subject: AppSubjects;
  readonly field?: keyof IUserSubject;
  readonly param?: string;
}
