'use client';

import { useMemo, useState } from 'react';

import { createColumnHelper } from '@tanstack/react-table';

import {
  DataTable,
  type DataTableFeatures,
} from '@/components/data-table';
import DashboardPanel from '@/components/global/DashboardPanel';
import { Badge } from '@/components/ui/badge';
import { useAuditLogs } from '@/features/audit-logs/hooks/use-audit-logs';
import { cn } from '@/lib/utils';
import { shamsi } from 'utils/functions';

interface IAuditLogRow {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  username: string | null;
  ipAddress: string | null;
  changesSummary: string | null;
  createdAt: string;
}

const columnHelper = createColumnHelper<DataTableFeatures, IAuditLogRow>();

function truncateText(text: string, maxLength = 80): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

function formatChanges(changes: Record<string, unknown> | null): string | null {
  if (!changes || Object.keys(changes).length === 0) {
    return null;
  }

  try {
    return JSON.stringify(changes, null, 0);
  } catch {
    return null;
  }
}

function AuditActionBadge({ action }: { readonly action: string }) {
  const isAuthAction = action.startsWith('auth.');

  return (
    <Badge
      variant="outline"
      className={cn(
        'mx-auto h-7 max-w-full truncate rounded-full px-2 text-[11px] font-semibold',
        isAuthAction
          ? 'border-primary/35 bg-primary/10 text-primary'
          : 'border-muted-foreground/35 bg-muted text-muted-foreground',
      )}
    >
      {action}
    </Badge>
  );
}

function AuditLogsPage() {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useAuditLogs(page, limit);

  const auditLogs: IAuditLogRow[] = (data?.items ?? []).map((log) => ({
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    username: log.user?.username ?? null,
    ipAddress: log.ipAddress,
    changesSummary: formatChanges(log.changes),
    createdAt: log.createdAt,
  }));

  const totalItems = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalItems / limit) || 1);

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor('createdAt', {
          header: 'تاریخ',
          cell: ({ getValue }) => shamsi(getValue(), 'YYYY/MM/DD HH:mm'),
        }),
        columnHelper.accessor('action', {
          header: 'عملیات',
          cell: ({ getValue }) => <AuditActionBadge action={getValue()} />,
        }),
        columnHelper.accessor('entityType', {
          header: 'نوع موجودیت',
          cell: ({ getValue }) => <div className="text-center text-sm">{getValue()}</div>,
        }),
        columnHelper.accessor('entityId', {
          header: 'شناسه موجودیت',
          cell: ({ getValue }) => (
            <span dir="ltr" className="block max-w-35 truncate font-mono text-xs">
              {getValue()}
            </span>
          ),
        }),
        columnHelper.accessor('username', {
          header: 'کاربر',
          cell: ({ getValue }) => (
            <div className="text-center text-sm">{getValue() ?? '—'}</div>
          ),
        }),
        columnHelper.accessor('ipAddress', {
          header: 'IP',
          cell: ({ getValue }) => (
            <span dir="ltr" className="block text-center text-sm">
              {getValue() ?? '—'}
            </span>
          ),
        }),
        columnHelper.accessor('changesSummary', {
          header: 'تغییرات',
          cell: ({ getValue }) => {
            const value = getValue();
            if (!value) {
              return <div className="text-center text-sm text-muted-foreground">—</div>;
            }

            return (
              <span
                dir="ltr"
                className="block max-w-xs truncate font-mono text-xs text-muted-foreground"
                title={value}
              >
                {truncateText(value, 120)}
              </span>
            );
          },
        }),
      ]),
    [],
  );

  return (
    <DashboardPanel title="لاگ‌های ممیزی">
      <DataTable
        columns={columns}
        data={auditLogs}
        isLoading={isLoading || isFetching}
        page={page}
        pageSize={limit}
        pageCount={pageCount}
        totalItems={totalItems}
        onPageChange={setPage}
        onPageSizeChange={(nextLimit) => {
          setPage(1);
          setLimit(nextLimit);
        }}
        pageSizeOptions={[1, 5, 10]}
        enableRowSelection={false}
      />
    </DashboardPanel>
  );
}

export default AuditLogsPage;
