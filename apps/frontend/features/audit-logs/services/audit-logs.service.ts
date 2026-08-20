import type { IAuditLog, IPaginatedResponse } from '@helali/shared';

import { apiClient, unwrapApiResponse } from '@/services/api-client';

export async function listAuditLogs(
  page = 1,
  limit = 10,
): Promise<IPaginatedResponse<IAuditLog>> {
  return unwrapApiResponse(
    apiClient.get('/audit-logs', {
      params: { page, limit },
    }),
  );
}
