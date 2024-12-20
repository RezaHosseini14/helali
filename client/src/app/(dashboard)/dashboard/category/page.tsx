'use client';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Button, Table } from 'rsuite';

// Services
import { deleteCategory, allCategory } from 'services/category/categoryServices';

// Components
import ConfirmModal from '@/components/global/ConfirmModal';
import DashboardPanel from '@/components/global/DashboardPanel';
import IconButton from '@/components/global/IconButton';
import TablePagination from '@/components/global/TablePagination';
import CreateCategoryModal from '@/components/pages/dashboard/category/createCategory.modal';

const { Column, HeaderCell, Cell } = Table;

function CategoriesListsPage() {
  const router = useRouter();

  // ---------------------- State and Ref ----------------------
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  const [showCreateCategory, setShowCreateCategory] = useState<boolean>(false);

  const handleOpenCreateCategoryModal = () => {
    setShowCreateCategory(true);
  };

  const handleCloseCreateCategoryModal = () => {
    setShowCreateCategory(false);
  };

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
        toast.success('دسته‌بندی با موفقیت حذف شد');
      } else {
        toast.error('حذف دسته‌بندی موفقیت‌آمیز نبود');
      }
    } catch (error) {
      toast.error('حذف دسته‌بندی موفقیت‌آمیز نبود');
    } finally {
      handleCloseConfirmModal();
    }
  };

  // ---------------------- Rendering ----------------------
  return (
    <DashboardPanel
      title="لیست دسته‌بندی"
      buttons={[
        {
          icon: 'ki-solid ki-plus-square',
          title: 'ایجاد دسته‌بندی',
          onClick: handleOpenCreateCategoryModal,
        },
      ]}
    >
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

      <CreateCategoryModal
        open={showCreateCategory}
        onClose={handleCloseCreateCategoryModal}
        closeModal={handleCloseCreateCategoryModal}
        message="لطفاً اطلاعات دسته‌بندی را وارد کنید"
        title="ایجاد دسته‌بندی جدید"
        confirmMsg="ثبت"
        refetch={refetch}
      />
    </DashboardPanel>
  );
}

export default CategoriesListsPage;
