'use client';

import { useMemo, useRef, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import {
  DataTable,
  dataTableActionsColumnDefaults,
  dataTableIdColumnDefaults,
  FileSizeBadge,
  FileTypeBadge,
  type DataTableFeatures,
} from '@/components/data-table';
import ConfirmModal from '@/components/global/ConfirmModal';
import DashboardPanel from '@/components/global/DashboardPanel';
import IconButton from '@/components/global/IconButton';
import CreateVideoModal from '@/components/pages/dashboard/video/CreateVideo.modal';
import UpdateVideoModal from '@/components/pages/dashboard/video/UpdateVideo.modal';
import { CanAccess } from '@/features/auth/components/can-access';
import { useAppAbility } from '@/features/auth/context/ability-provider';
import { handleResponse, shamsi } from 'utils/functions';
import { allVideo, deleteVideo, reprocessVideo } from 'services/video/videoServices';

interface IVideoRow {
  id: number;
  title: string;
  text: string;
  originalName: string;
  mimetype: string;
  size: number | string;
  like: number;
  view: number;
  processingStatus?: 'pending' | 'processing' | 'ready' | 'failed';
  created_at: string;
  createdAt?: string;
}

const PROCESSING_LABELS: Record<string, string> = {
  pending: 'در صف',
  processing: 'در حال پردازش',
  ready: 'آماده',
  failed: 'ناموفق',
};

const columnHelper = createColumnHelper<DataTableFeatures, IVideoRow>();

function VideosListsPage() {
  const ability = useAppAbility();
  const canCreate = ability.can('create', 'Video');
  const canUpdate = ability.can('update', 'Video');
  const canDelete = ability.can('delete', 'Video');
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateId, setUpdateId] = useState(0);
  const clearSelectionRef = useRef<(() => void) | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['allvideo', { page, limit }],
    queryFn: ({ queryKey }: { queryKey: [string, { page: number; limit: number }] }) => {
      const [, params] = queryKey;
      return allVideo(params.page, params.limit);
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['deleteVideo'],
    mutationFn: (id: number) => deleteVideo(id),
  });

  const { mutateAsync: reprocessMutate, isPending: isReprocessing } = useMutation({
    mutationKey: ['reprocessVideo'],
    mutationFn: (id: number) => reprocessVideo(id),
  });

  function handleOpenConfirmModal(id: number): void {
    setSelectedIds([id]);
    setShowConfirm(true);
  }

  function handleCloseConfirmModal(): void {
    setSelectedIds([]);
    setShowConfirm(false);
  }

  async function handleDelete(): Promise<void> {
    if (selectedIds.length === 0) {
      return;
    }

    try {
      const results = await Promise.all(selectedIds.map((id) => mutateAsync(id)));
      if (results.some((res) => res.status === 200)) {
        refetch();
        clearSelectionRef.current?.();
      }
      handleResponse(results[0] ?? null, null, '', '');
    } catch (error) {
      handleResponse(null, error, '', 'مشکلی در حذف ویدیویی رخ داده است');
    } finally {
      handleCloseConfirmModal();
    }
  }

  const videos: IVideoRow[] = data?.data?.videos ?? [];
  const totalItems = data?.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalItems / limit) || 1);

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor('id', {
          ...dataTableIdColumnDefaults,
          cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
        }),
        columnHelper.accessor('title', {
          header: 'عنوان',
        }),
        columnHelper.accessor('text', {
          header: 'توضیحات',
          cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
        }),
        columnHelper.accessor('originalName', {
          header: 'نام فایل',
        }),
        columnHelper.accessor('mimetype', {
          header: 'نوع فایل',
          cell: ({ getValue }) => <FileTypeBadge mimetype={getValue()} />,
        }),
        columnHelper.accessor('size', {
          header: 'حجم',
          cell: ({ getValue }) => <FileSizeBadge bytes={getValue()} />,
        }),
        columnHelper.accessor('like', {
          header: 'لایک',
        }),
        columnHelper.accessor('view', {
          header: 'بازدید',
        }),
        columnHelper.accessor((row) => row.processingStatus ?? 'ready', {
          id: 'processingStatus',
          header: 'HLS',
          cell: ({ getValue }) => {
            const status = String(getValue());
            return (
              <span className="inline-flex rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {PROCESSING_LABELS[status] ?? status}
              </span>
            );
          },
        }),
        columnHelper.accessor((row) => row.createdAt ?? row.created_at, {
          id: 'created_at',
          header: 'تاریخ ایجاد',
          cell: ({ getValue }) => shamsi(String(getValue()), 'YYYY/MM/DD'),
        }),
        columnHelper.display({
          ...dataTableActionsColumnDefaults,
          cell: ({ row }) => (
            <div className="inline-flex items-center justify-center gap-1">
              <CanAccess I="update" a="Video">
                <IconButton
                  className="update-btn"
                  icon="ki-solid ki-pencil"
                  onClick={() => {
                    setUpdateId(row.original.id);
                    setShowUpdate(true);
                  }}
                  tooltipText="بروزرسانی"
                />
              </CanAccess>
              <CanAccess I="update" a="Video">
                <IconButton
                  className="update-btn"
                  icon="ki-solid ki-arrows-circle"
                  disabled={isReprocessing}
                  onClick={() => {
                    void reprocessMutate(row.original.id)
                      .then((res) => {
                        handleResponse(res, null, 'پردازش HLS در صف قرار گرفت', '');
                        void refetch();
                      })
                      .catch((error) => {
                        handleResponse(null, error, '', 'پردازش مجدد ناموفق بود');
                      });
                  }}
                  tooltipText="تولید مجدد HLS"
                />
              </CanAccess>
              <CanAccess I="delete" a="Video">
                <IconButton
                  className="trash-btn"
                  icon="ki-solid ki-trash"
                  onClick={() => handleOpenConfirmModal(row.original.id)}
                  tooltipText="حذف فایل ویدیویی"
                />
              </CanAccess>
            </div>
          ),
        }),
      ]),
    [canDelete, canUpdate, isReprocessing, reprocessMutate, refetch],
  );

  return (
    <DashboardPanel
      title="لیست ویدیوها"
      buttons={
        canCreate
          ? [
              {
                icon: 'ki-solid ki-plus-square',
                title: 'ایجاد ویدیو',
                onClick: () => setShowCreate(true),
              },
            ]
          : []
      }
    >
      <DataTable
        columns={columns}
        data={videos}
        isLoading={isLoading}
        page={page}
        pageSize={limit}
        pageCount={pageCount}
        totalItems={totalItems}
        pageSizeOptions={[1, 5, 10]}
        onPageChange={setPage}
        onPageSizeChange={(nextLimit) => {
          setPage(1);
          setLimit(nextLimit);
        }}
        isBulkDeleting={isPending}
        onBulkDelete={
          canDelete
            ? (ids, clearSelection) => {
                clearSelectionRef.current = clearSelection;
                setSelectedIds(ids.map(Number));
                setShowConfirm(true);
              }
            : undefined
        }
      />

      <ConfirmModal
        open={showConfirm}
        onClose={handleCloseConfirmModal}
        title="تأیید حذف"
        message={
          selectedIds.length > 1
            ? `آیا مطمئن هستید که می‌خواهید ${selectedIds.length} فایل ویدیویی انتخاب‌شده را حذف کنید؟`
            : 'آیا مطمئن هستید که می‌خواهید این فایل ویدیویی را حذف کنید؟'
        }
        loading={isPending}
        confirmMsg="حذف"
        handleDelete={handleDelete}
      />

      <CreateVideoModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        refetch={refetch}
      />

      <UpdateVideoModal
        open={showUpdate}
        id={updateId}
        onClose={() => {
          setShowUpdate(false);
          setUpdateId(0);
        }}
        refetch={refetch}
      />
    </DashboardPanel>
  );
}

export default VideosListsPage;
