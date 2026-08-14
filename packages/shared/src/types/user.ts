export type UserRole = 'SUPER' | 'ADMIN' | 'USER';

export interface IUser {
  readonly id: number;
  readonly username: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly age?: number | null;
  readonly email?: string | null;
  readonly role: UserRole;
  readonly createdAt: string;
}

export interface IUserProfile {
  readonly id: number;
  readonly username: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly age?: number | null;
  readonly email?: string | null;
  readonly role: UserRole;
  readonly permissions?: ReadonlyArray<string>;
}

export interface ICreateUserInput {
  readonly username: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly age?: number;
  readonly email?: string;
  readonly role?: UserRole;
}

export interface IUpdateUserInput {
  readonly username?: string;
  readonly password?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly phoneNumber?: string;
  readonly age?: number;
  readonly email?: string;
  readonly role?: UserRole;
}
