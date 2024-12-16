'use client';
import DashboardPanel from '@/components/global/DashboardPanel';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Table } from 'rsuite';
import { allUser } from 'services/user/userServices';
import { shamsi } from 'utils/functions';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/global/ConfirmModal';

const { Column, HeaderCell, Cell } = Table;

function UserPage() {
  const { data, isLoading, refetch } = useQuery({ queryKey: ['allUser'], queryFn: allUser });
  // const { mutateAsync, isPending } = useMutation({
  //   mutationKey: ['deleteUser'],
  //   mutationFn: (id: number) => deleteUser(id),
  // });

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const openConfirmModal = (id: number) => {
    setSelectedId(id);
    setShowConfirm(true);
  };

  const closeConfirmModal = () => {
    setSelectedId(null);
    setShowConfirm(false);
  };

  // const handleDelete = async () => {
  //   if (!selectedId) return;
  //   try {
  //     const res = await mutateAsync(selectedId);
  //     if (res.status === 200) {
  //       refetch();
  //       toast.success('کاربر با موفقیت حذف شد');
  //     } else {
  //       toast.error('کاربر حذف نشد');
  //     }
  //   } catch (error) {
  //     toast.error('خطا در حذف کاربر');
  //   } finally {
  //     closeConfirmModal();
  //   }
  // };

  return (
    <DashboardPanel title="لیست کاربران">
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
              <div className="grid place-content-center">
                <i
                  className="ki-solid ki-trash cursor-pointer text-red-500 w-fit"
                  onClick={() => openConfirmModal(rowData.id)}
                ></i>
              </div>
            )}
          </Cell>
        </Column>
      </Table>

      {/* <ConfirmModal
        open={showConfirm}
        onClose={closeConfirmModal}
        title="تأیید حذف"
        message="آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟"
        closeConfirmModal={closeConfirmModal}
        loading={isPending}
        confirmMsg="حذف"
        handleDelete={handleDelete}
      /> */}
    </DashboardPanel>
  );
}

export default UserPage;
