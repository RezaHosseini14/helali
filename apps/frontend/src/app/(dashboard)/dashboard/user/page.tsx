'use client';

import { useMemo, useRef, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import toast from 'react-hot-toast';

import {
  DataTable,
  dataTableActionsColumnDefaults,
  dataTableIdColumnDefaults,
  type DataTableFeatures,
} from '@/components/data-table';
import ConfirmModal from '@/components/global/ConfirmModal';
import DashboardPanel from '@/components/global/DashboardPanel';
import IconButton from '@/components/global/IconButton';
import CreateUserModal from '@/components/pages/dashboard/user/CreateUser.modal';
import { useCurrentUser } from '@/features/auth/hooks/use-current-user';
import { handleResponse, shamsi } from 'utils/functions';
import { allUser, deleteUser } from 'services/user/userServices';

interface IUserRow {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  age: number;
  email: string;
  created_at: string;
}

const columnHelper = createColumnHelper<DataTableFeatures, IUserRow>();

function UserPage() {
  const { data: currentUser } = useCurrentUser();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const clearSelectionRef = useRef<(() => void) | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['allUser', { page, limit }],
    queryFn: ({ queryKey }: { queryKey: [string, { page: number; limit: number }] }) => {
      const [, params] = queryKey;
      return allUser(params.page, params.limit);
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['deleteUser'],
    mutationFn: (id: number) => deleteUser(id),
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
      toast.error('خطا در حذف کاربر');
      handleResponse(null, error, '', 'مشکلی در حذف کاربر رخ داده است');
    } finally {
      handleCloseConfirmModal();
    }
  }

  const users: IUserRow[] = data?.data?.users ?? [];
  const totalItems = data?.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalItems / limit) || 1);

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor('id', {
          ...dataTableIdColumnDefaults,
          cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
        }),
        columnHelper.accessor('username', {
          header: 'نام‌کاربری',
          cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
        }),
        columnHelper.accessor('first_name', {
          header: 'نام',
          cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
        }),
        columnHelper.accessor('last_name', {
          header: 'نام خانوادگی',
        }),
        columnHelper.accessor('phone_number', {
          header: 'شماره همراه',
        }),
        columnHelper.accessor('age', {
          header: 'سن',
        }),
        columnHelper.accessor('email', {
          header: 'ایمیل',
        }),
        columnHelper.accessor('created_at', {
          header: 'تاریخ ایجاد',
          cell: ({ getValue }) => shamsi(getValue(), 'YYYY/MM/DD'),
        }),
        columnHelper.display({
          ...dataTableActionsColumnDefaults,
          cell: ({ row }) =>
            currentUser?.username === row.original.username ? null : (
              <div className="inline-flex items-center justify-center gap-1">
                <IconButton
                  className="trash-btn"
                  icon="ki-solid ki-trash"
                  onClick={() => handleOpenConfirmModal(row.original.id)}
                  tooltipText="حذف کاربر"
                />
              </div>
            ),
        }),
      ]),
    [currentUser?.username],
  );

  return (
    <DashboardPanel
      title="لیست کاربران"
      buttons={[
        {
          icon: 'ki-solid ki-plus-square',
          title: 'ایجاد کاربر',
          onClick: () => setShowCreate(true),
        },
      ]}
    >
      <DataTable
        columns={columns}
        data={users}
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
        isRowSelectable={(row) => currentUser?.username !== row.username}
        isBulkDeleting={isPending}
        onBulkDelete={(ids, clearSelection) => {
          clearSelectionRef.current = clearSelection;
          setSelectedIds(ids.map(Number));
          setShowConfirm(true);
        }}
      />

      <ConfirmModal
        open={showConfirm}
        onClose={handleCloseConfirmModal}
        title="تأیید حذف"
        message={
          selectedIds.length > 1
            ? `آیا مطمئن هستید که می‌خواهید ${selectedIds.length} کاربر انتخاب‌شده را حذف کنید؟`
            : 'آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟'
        }
        loading={isPending}
        confirmMsg="حذف"
        handleDelete={handleDelete}
      />

      <CreateUserModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        refetch={refetch}
      />
    </DashboardPanel>
  );
}

export default UserPage;
