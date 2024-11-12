import { Role } from '../enums/role.enums';

export type UserType = {
  userId: string;
  username: string;
  status: boolean;
  roles: Role[];
  iat: number;
  exp: number;
};
