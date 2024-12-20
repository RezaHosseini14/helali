'use client';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Table } from 'rsuite';

// Services
import { deleteCategory } from 'services/category/categoryServices';
import { allCategory } from 'services/category/categoryServices';

//Functions
import { getFileSize } from 'utils/functions';

//Components
import ConfirmModal from '@/components/global/ConfirmModal';
import DashboardPanel from '@/components/global/DashboardPanel';
import IconButton from '@/components/global/IconButton';
import TablePagination from '@/components/global/TablePagination';

const { Column, HeaderCell, Cell } = Table;

function categoriesListsPage() {
  const router = useRouter();

  // ---------------------- State and Ref ----------------------
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // ---------------------- Data Fetching ----------------------
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['allCategory', { page, limit }],
    queryFn: ({ queryKey }: { queryKey: [string, { page: number; limit: number }] }) => {
      const [, params] = queryKey;
      return allCategory(params.page, params.limit);
    },
  });

  // ---------------------- Mutations ----------------------
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['deleteCategory'],
    mutationFn: (id: number) => deleteCategory(id),
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
        toast.success('فایل تصویری با موفقیت حذف شد');
      } else {
        toast.error('فایل تصویری حذف نشد');
      }
    } catch (error) {
      toast.error('فایل تصویری حذف نشد');
    } finally {
      handleCloseConfirmModal();
    }
  };

  // ---------------------- Rendering ----------------------
  return (
    <DashboardPanel title="لیست دسته‌بندی">
      <TablePagination
        page={page}
        limit={limit}
        total={data?.data?.total}
        setPage={setPage}
        handleChangeLimit={handleChangeLimit}
      >
        <Table bordered autoHeight data={data?.data?.categories} loading={isLoading}>
          <Column width={60} align="center">
            <HeaderCell>شناسه</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column flexGrow={1} align="center">
            <HeaderCell>عنوان</HeaderCell>
            <Cell dataKey="title" />
          </Column>

          <Column flexGrow={1} align="center">
            <HeaderCell>چیدمان</HeaderCell>
            <Cell dataKey="sort" />
          </Column>

          <Column width={85}>
            <HeaderCell> </HeaderCell>
            <Cell>
              {(rowData) => (
                <div className="flex items-center gap-2">
                  <IconButton
                    className="update-btn"
                    icon="ki-solid ki-pencil"
                    onClick={() => router.replace(`/dashboard/category/update/${rowData.id}`)}
                    tooltipText="بروزرسانی"
                  />
                  <IconButton
                    className="trash-btn"
                    icon="ki-solid ki-trash"
                    onClick={() => handleOpenConfirmModal(rowData.id)}
                    tooltipText="حذف دسته‌بندی"
                  />
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
        message="آیا مطمئن هستید که می‌خواهید این دسته‌بندی را حذف کنید؟"
        closeConfirmModal={handleCloseConfirmModal}
        loading={isPending}
        confirmMsg="حذف"
        handleDelete={handleDelete}
      />
    </DashboardPanel>
  );
}

export default categoriesListsPage;
