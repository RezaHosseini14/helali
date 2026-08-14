'use client';

import { useMemo } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import {
  DataTable,
  dataTableActionsColumnDefaults,
  dataTableIdColumnDefaults,
  type DataTableFeatures,
} from '@/components/data-table';
import DashboardPanel from '@/components/global/DashboardPanel';
import IconButton from '@/components/global/IconButton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { handleResponse, shamsi } from 'utils/functions';
import { getAllComments, updateCommentStatus } from 'services/comment/commentServices';

type CommentType = 'audio' | 'gallery' | 'video';
type CommentStatus = 'pending' | 'published' | 'rejected';

interface ICommentStatusBody {
  newStatus: CommentStatus;
}

interface ICommentRow {
  id: number;
  author: string;
  text: string;
  status: CommentStatus;
  type: CommentType;
  targetTitle?: string;
  updated_at: string;
  created_at: string;
}

const columnHelper = createColumnHelper<DataTableFeatures, ICommentRow>();

const TYPE_LABELS: Record<CommentType, string> = {
  audio: 'صوت',
  gallery: 'گالری',
  video: 'ویدیو',
};

const STATUS_CONFIG: Record<
  CommentStatus,
  { label: string; icon: string; className: string }
> = {
  pending: {
    label: 'در انتظار',
    icon: 'ki-outline ki-time',
    className: 'border-amber-500/35 bg-amber-500/10 text-amber-800',
  },
  published: {
    label: 'منتشر شده',
    icon: 'ki-outline ki-check-circle',
    className: 'border-primary/35 bg-primary/10 text-primary',
  },
  rejected: {
    label: 'رد شده',
    icon: 'ki-outline ki-cross-circle',
    className: 'border-destructive/35 bg-destructive/10 text-destructive',
  },
};

function CommentStatusBadge({ status }: { readonly status: CommentStatus }) {
  const config = STATUS_CONFIG[status] ?? {
    label: 'نامشخص',
    icon: 'ki-outline ki-information-2',
    className: 'border-border bg-muted text-muted-foreground',
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        'mx-auto h-7 max-w-full gap-1 truncate rounded-full px-2 text-[11px] font-semibold',
        config.className,
      )}
    >
      <i className={cn(config.icon, 'text-sm')} />
      {config.label}
    </Badge>
  );
}

function CommentsListsPage() {
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['allComments'],
    queryFn: () => getAllComments(),
  });

  const { mutateAsync } = useMutation({
    mutationKey: ['updateCommentStatus'],
    mutationFn: ({
      commentType,
      commentId,
      body,
    }: {
      commentType: CommentType;
      commentId: number;
      body: ICommentStatusBody;
    }) => updateCommentStatus(commentType, commentId, body),
  });

  async function handleChangeStatus(
    commentType: CommentType,
    commentId: number,
    body: ICommentStatusBody,
  ): Promise<void> {
    try {
      const res = await mutateAsync({ commentType, commentId, body });
      if (res.status === 200) {
        void refetch();
      }
      handleResponse(res, null, '', '');
    } catch (error) {
      handleResponse(null, error, '', 'مشکلی در تغییر وضعیت نظر رخ داده است');
    }
  }

  const comments: ICommentRow[] = data?.data?.comments ?? [];

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor('id', {
          ...dataTableIdColumnDefaults,
          cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
        }),
        columnHelper.accessor('type', {
          header: 'نوع',
          cell: ({ getValue }) => (
            <div className="text-center text-sm text-muted-foreground">
              {TYPE_LABELS[getValue()] ?? getValue()}
            </div>
          ),
        }),
        columnHelper.accessor('targetTitle', {
          header: 'مربوط به',
          cell: ({ getValue }) => getValue() || '—',
        }),
        columnHelper.accessor('author', {
          header: 'نویسنده',
        }),
        columnHelper.accessor('text', {
          header: 'دیدگاه',
        }),
        columnHelper.accessor('status', {
          header: 'وضعیت',
          cell: ({ getValue }) => <CommentStatusBadge status={getValue()} />,
        }),
        columnHelper.accessor('updated_at', {
          header: 'آخرین بروزرسانی',
          cell: ({ getValue }) => shamsi(getValue(), 'YYYY/MM/DD'),
        }),
        columnHelper.accessor('created_at', {
          header: 'تاریخ ایجاد',
          cell: ({ getValue }) => shamsi(getValue(), 'YYYY/MM/DD'),
        }),
        columnHelper.display({
          ...dataTableActionsColumnDefaults,
          cell: ({ row }) => {
            const { id, status, type } = row.original;

            return (
              <div className="inline-flex items-center justify-center gap-1">
                <IconButton
                  className="create-btn"
                  icon="ki-solid ki-check"
                  onClick={() =>
                    void handleChangeStatus(type, id, { newStatus: 'published' })
                  }
                  tooltipText="انتشار"
                  disabled={status === 'published'}
                />
                <IconButton
                  className="update-btn"
                  icon="ki-solid ki-time"
                  onClick={() => void handleChangeStatus(type, id, { newStatus: 'pending' })}
                  tooltipText="بازگشت به انتظار"
                  disabled={status === 'pending'}
                />
                <IconButton
                  className="trash-btn"
                  icon="ki-solid ki-cross"
                  onClick={() => void handleChangeStatus(type, id, { newStatus: 'rejected' })}
                  tooltipText="رد کردن"
                  disabled={status === 'rejected'}
                />
              </div>
            );
          },
        }),
      ]),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handlers are stable enough for this list page
    [],
  );

  return (
    <DashboardPanel title="لیست نظرات">
      <DataTable
        columns={columns}
        data={comments}
        isLoading={isLoading || isFetching}
        totalItems={data?.data?.total ?? comments.length}
        pageSizeOptions={[5, 10, 20]}
      />
    </DashboardPanel>
  );
}

export default CommentsListsPage;
