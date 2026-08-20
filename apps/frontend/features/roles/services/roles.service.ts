import type {
  IApiResponse,
  ICreateRoleInput,
  IPermission,
  IRoleDetail,
  IUpdateRoleInput,
} from '@helali/shared';

import { apiClient, unwrapApiResponse } from '@/services/api-client';

export const rolesService = {
  async list(): Promise<ReadonlyArray<IRoleDetail>> {
    return unwrapApiResponse(
      apiClient.get<IApiResponse<ReadonlyArray<IRoleDetail>>>('/roles'),
    );
  },

  async getById(id: number): Promise<IRoleDetail> {
    return unwrapApiResponse(apiClient.get<IApiResponse<IRoleDetail>>(`/roles/${id}`));
  },

  async listPermissions(): Promise<ReadonlyArray<IPermission>> {
    return unwrapApiResponse(
      apiClient.get<IApiResponse<ReadonlyArray<IPermission>>>('/roles/permissions/catalog'),
    );
  },

  async create(input: ICreateRoleInput): Promise<IRoleDetail> {
    return unwrapApiResponse(
      apiClient.post<IApiResponse<IRoleDetail>>('/roles', input),
    );
  },

  async update(id: number, input: IUpdateRoleInput): Promise<IRoleDetail> {
    return unwrapApiResponse(
      apiClient.patch<IApiResponse<IRoleDetail>>(`/roles/${id}`, input),
    );
  },

  async remove(id: number): Promise<IRoleDetail> {
    return unwrapApiResponse(
      apiClient.delete<IApiResponse<IRoleDetail>>(`/roles/${id}`),
    );
  },
};
