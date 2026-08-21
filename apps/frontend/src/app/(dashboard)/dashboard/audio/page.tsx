'use client';

import { useMemo, useRef, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import {
  DataTable,
  DataTableActions,
  dataTableActionsColumnDefaults,
  dataTableIdColumnDefaults,
  FileSizeBadge,
  FileTypeBadge,
  type DataTableFeatures,
} from '@/components/data-table';
import ConfirmModal from '@/components/global/ConfirmModal';
import DashboardPanel from '@/components/global/DashboardPanel';
import IconButton from '@/components/global/IconButton';
import CreateAudioModal from '@/components/pages/dashboard/audio/CreateAudio.modal';
import UpdateAudioModal from '@/components/pages/dashboard/audio/UpdateAudio.modal';
import { CanAccess } from '@/features/auth/components/can-access';
import { useAppAbility } from '@/features/auth/context/ability-provider';
import { handleResponse, shamsi } from 'utils/functions';
import { allAudio, deleteAudio } from 'services/audio/audioServices';

interface IAudioRow {
  id: number;
  title: string;
  originalName: string;
  mimetype: string;
  size: number | string;
  like: number;
  view: number;
  created_at: string;
}

const columnHelper = createColumnHelper<DataTableFeatures, IAudioRow>();

function AudiosListsPage() {
  const ability = useAppAbility();
  const canCreate = ability.can('create', 'Audio');
  const canUpdate = ability.can('update', 'Audio');
  const canDelete = ability.can('delete', 'Audio');
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateId, setUpdateId] = useState(0);
  const clearSelectionRef = useRef<(() => void) | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['allAudio', { page, limit }],
    queryFn: ({ queryKey }: { queryKey: [string, { page: number; limit: number }] }) => {
      const [, params] = queryKey;
      return allAudio(params.page, params.limit);
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['deleteAudio'],
    mutationFn: (id: number) => deleteAudio(id),
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
      handleResponse(null, error, '', 'مشکلی در حذف صوت رخ داده است');
    } finally {
      handleCloseConfirmModal();
    }
  }

  const audios: IAudioRow[] = data?.data?.audios ?? [];
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
        columnHelper.accessor('created_at', {
          header: 'تاریخ ایجاد',
          cell: ({ getValue }) => shamsi(getValue(), 'YYYY/MM/DD'),
        }),
        columnHelper.display({
          ...dataTableActionsColumnDefaults,
          cell: ({ row }) => (
            <DataTableActions>
              <CanAccess I="update" a="Audio" preserveSlot>
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
              <CanAccess I="delete" a="Audio" preserveSlot>
                <IconButton
                  className="trash-btn"
                  icon="ki-solid ki-trash"
                  onClick={() => handleOpenConfirmModal(row.original.id)}
                  tooltipText="حذف فایل صوتی"
                />
              </CanAccess>
            </DataTableActions>
          ),
        }),
      ]),
    [canDelete, canUpdate],
  );

  return (
    <DashboardPanel
      title="لیست صوت‌ها"
      buttons={
        canCreate
          ? [
              {
                icon: 'ki-solid ki-plus-square',
                title: 'ایجاد صوت',
                onClick: () => setShowCreate(true),
              },
            ]
          : []
      }
    >
      <DataTable
        columns={columns}
        data={audios}
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
            ? `آیا مطمئن هستید که می‌خواهید ${selectedIds.length} فایل صوتی انتخاب‌شده را حذف کنید؟`
            : 'آیا مطمئن هستید که می‌خواهید این فایل صوتی را حذف کنید؟'
        }
        loading={isPending}
        confirmMsg="حذف"
        handleDelete={handleDelete}
      />

      <CreateAudioModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        refetch={refetch}
      />

      <UpdateAudioModal
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

export default AudiosListsPage;
