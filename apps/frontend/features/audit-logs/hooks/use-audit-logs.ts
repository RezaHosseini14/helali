'use client';

import { useQuery } from '@tanstack/react-query';

import { auditKeys } from '@/features/audit-logs/hooks/audit-keys';
import { listAuditLogs } from '@/features/audit-logs/services/audit-logs.service';

export function useAuditLogs(page: number, limit: number) {
  return useQuery({
    queryKey: auditKeys.list(page, limit),
    queryFn: () => listAuditLogs(page, limit),
  });
}
