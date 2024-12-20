'use client';
import DashboardPanel from '@/components/global/DashboardPanel';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Table } from 'rsuite';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

//Services
import { allUser, deleteUser } from 'services/user/userServices';

//Functions
import { shamsi } from 'utils/functions';

//Components
import ConfirmModal from '@/components/global/ConfirmModal';
import IconButton from '@/components/global/IconButton';
import TablePagination from '@/components/global/TablePagination';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const { Column, HeaderCell, Cell } = Table;

function UserPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);

  // ---------------------- State and Ref ----------------------
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // ---------------------- Data Fetching ----------------------
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['allUser', { page, limit }],
    queryFn: ({ queryKey }: { queryKey: [string, { page: number; limit: number }] }) => {
      const [, params] = queryKey;
      return allUser(params.page, params.limit);
    },
  });

  // ---------------------- Mutations ----------------------
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['deleteUser'],
    mutationFn: (id: number) => deleteUser(id),
  });

  // ---------------------- Event Handlers ----------------------
  const handleOpenConfirmModal = (id: number) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const handleCloseConfirmModal = () => {
    setSelectedId(null);
    setShowConfirm(false);
  };

  const handleChangeLimit = (dataKey: any) => {
    setPage(1);
    setLimit(dataKey);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    try {
      const res = await mutateAsync(selectedId);
      if (res.status === 200) {
        refetch();
        toast.success('کاربر با موفقیت حذف شد');
      } else {
        toast.error('کاربر حذف نشد');
      }
    } catch (error) {
      toast.error('خطا در حذف کاربر');
    } finally {
      handleCloseConfirmModal();
    }
  };

  // ---------------------- Rendering ----------------------
  return (
    <DashboardPanel title="لیست کاربران">
      <TablePagination
        page={page}
        limit={limit}
        total={data?.data?.total}
        setPage={setPage}
        handleChangeLimit={handleChangeLimit}
      >
        <Table bordered autoHeight data={data?.data?.users} loading={isLoading}>
          <Column width={60} align="center" fixed>
            <HeaderCell>شناسه</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column flexGrow={1} align="center" fixed>
            <HeaderCell>نام‌کاربری</HeaderCell>
            <Cell dataKey="username" />
          </Column>

          <Column flexGrow={1} align="center" fixed>
            <HeaderCell>نام</HeaderCell>
            <Cell dataKey="first_name" />
          </Column>

          <Column flexGrow={1}>
            <HeaderCell>نام خانوادگی</HeaderCell>
            <Cell dataKey="last_name" />
          </Column>

          <Column flexGrow={1}>
            <HeaderCell>شماره همراه</HeaderCell>
            <Cell dataKey="phone_number" />
          </Column>

          <Column flexGrow={1}>
            <HeaderCell>سن</HeaderCell>
            <Cell dataKey="age" />
          </Column>

          <Column flexGrow={1}>
            <HeaderCell>ایمیل</HeaderCell>
            <Cell dataKey="email" />
          </Column>

          <Column flexGrow={1}>
            <HeaderCell>تاریخ ایجاد</HeaderCell>
            <Cell>{(rowData: any) => <span>{shamsi(rowData.created_at, 'YYYY/MM/DD')}</span>}</Cell>
          </Column>

          <Column width={80} fixed="right">
            <HeaderCell> </HeaderCell>
            <Cell>
              {(rowData) => (
                <div className="flex items-center gap-2">
                  <IconButton
                    className="update-btn"
                    icon="ki-solid ki-pencil"
                    onClick={() => router.replace(`/dashboard/user/update/${rowData.id}`)}
                    tooltipText="بروزرسانی"
                  />
                  {user.username === rowData.username ? null : (
                    <IconButton
                      className="trash-btn"
                      icon="ki-solid ki-trash"
                      onClick={() => handleOpenConfirmModal(rowData.id)}
                      tooltipText="حذف کاربر"
                    />
                  )}
                </div>
              )}
            </Cell>
          </Column>
        </Table>
      </TablePagination>
      <ConfirmModal
        open={showConfirm}
        onClose={handleCloseConfirmModal}
        title="تأیید حذف"
        message="آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟"
        loading={isPending}
        confirmMsg="حذف"
        handleDelete={handleDelete}
      />
    </DashboardPanel>
  );
}

export default UserPage;
