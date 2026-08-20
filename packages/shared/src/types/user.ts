export interface IUser {
  readonly id: number;
  readonly username: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phoneNumber: string;
  readonly age?: number | null;
  readonly email?: string | null;
  readonly roleId: number;
  readonly role: string;
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
  readonly roleId: number;
  readonly role: string;
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
  readonly roleId?: number;
}

export interface IUpdateUserInput {
  readonly username?: string;
  readonly password?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly phoneNumber?: string;
  readonly age?: number;
  readonly email?: string;
  readonly roleId?: number;
}
