export interface IRole {
  readonly id: number;
  readonly name: string;
  readonly description: string;
}

export interface IPermission {
  readonly id: number;
  readonly name: string;
  readonly description: string;
}

export interface IRoleDetail {
  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly isSystem: boolean;
  readonly permissions: ReadonlyArray<IPermission>;
  readonly userCount: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ICreateRoleInput {
  readonly name: string;
  readonly description: string;
  readonly permissionIds: ReadonlyArray<number>;
}

export interface IUpdateRoleInput {
  readonly description?: string;
  readonly permissionIds?: ReadonlyArray<number>;
}
