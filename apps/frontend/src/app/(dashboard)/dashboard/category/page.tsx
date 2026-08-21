'use client';

import { useMemo, useRef, useState } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import {
  DataTable,
  DataTableActionSlot,
  DataTableActions,
  dataTableActionsColumnDefaults,
  dataTableIdColumnDefaults,
  type DataTableFeatures,
} from '@/components/data-table';
import ConfirmModal from '@/components/global/ConfirmModal';
import DashboardPanel from '@/components/global/DashboardPanel';
import IconButton from '@/components/global/IconButton';
import CreateCategoryModal from '@/components/pages/dashboard/category/CreateCategory.modal';
import UpdateCategoryModal from '@/components/pages/dashboard/category/UpdateCategory.modal';
import { handleResponse } from 'utils/functions';
import { allCategory, deleteCategory } from 'services/category/categoryServices';

interface ICategoryRow {
  id: number;
  title: string;
  sort: number;
}

const columnHelper = createColumnHelper<DataTableFeatures, ICategoryRow>();

function CategoriesListsPage() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [showUpdateCategory, setShowUpdateCategory] = useState(false);
  const [idCategory, setIdCategory] = useState(0);
  const clearSelectionRef = useRef<(() => void) | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['allCategory', { page, limit }],
    queryFn: ({ queryKey }: { queryKey: [string, { page: number; limit: number }] }) => {
      const [, params] = queryKey;
      return allCategory(params.page, params.limit);
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['deleteCategory'],
    mutationFn: (id: number) => deleteCategory(id),
  });

  function handleOpenConfirmModal(id: number): void {
    setSelectedIds([id]);
    setShowConfirm(true);
  }

  function handleCloseConfirmModal(): void {
    setSelectedIds([]);
    setShowConfirm(false);
  }

  function handleOpenUpdateCategoryModal(id: number): void {
    setShowUpdateCategory(true);
    setIdCategory(id);
  }

  function handleCloseUpdateCategoryModal(): void {
    setShowUpdateCategory(false);
    setIdCategory(0);
  }

  function handleOpenCreateCategoryModal(): void {
    setShowCreateCategory(true);
  }

  function handleCloseCreateCategoryModal(): void {
    setShowCreateCategory(false);
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
      handleResponse(null, error, '', 'مشکلی در حذف دسته‌بندی رخ داده است');
    } finally {
      handleCloseConfirmModal();
    }
  }

  const categories: ICategoryRow[] = data?.data?.categories ?? [];
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
        columnHelper.accessor('sort', {
          header: 'چیدمان',
          cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
        }),
        columnHelper.display({
          ...dataTableActionsColumnDefaults,
          cell: ({ row }) => (
            <DataTableActions>
              <DataTableActionSlot>
                <IconButton
                  className="update-btn"
                  icon="ki-solid ki-pencil"
                  onClick={() => handleOpenUpdateCategoryModal(row.original.id)}
                  tooltipText="بروزرسانی"
                />
              </DataTableActionSlot>
              <DataTableActionSlot>
                <IconButton
                  className="trash-btn"
                  icon="ki-solid ki-trash"
                  onClick={() => handleOpenConfirmModal(row.original.id)}
                  tooltipText="حذف دسته‌بندی"
                />
              </DataTableActionSlot>
            </DataTableActions>
          ),
        }),
      ]),
    [],
  );

  return (
    <DashboardPanel
      title="لیست دسته‌بندی‌ها"
      buttons={[
        {
          icon: 'ki-solid ki-plus-square',
          title: 'ایجاد دسته‌بندی',
          onClick: handleOpenCreateCategoryModal,
        },
      ]}
    >
      <DataTable
        columns={columns}
        data={categories}
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
            ? `آیا مطمئن هستید که می‌خواهید ${selectedIds.length} دسته‌بندی انتخاب‌شده را حذف کنید؟`
            : 'آیا مطمئن هستید که می‌خواهید این دسته‌بندی را حذف کنید؟'
        }
        loading={isPending}
        confirmMsg="حذف"
        handleDelete={handleDelete}
      />

      <CreateCategoryModal
        open={showCreateCategory}
        onClose={handleCloseCreateCategoryModal}
        message="لطفاً اطلاعات دسته‌بندی را وارد کنید"
        title="ایجاد دسته‌بندی جدید"
        confirmMsg="ثبت"
        refetch={refetch}
      />

      <UpdateCategoryModal
        id={idCategory}
        open={showUpdateCategory}
        onClose={handleCloseUpdateCategoryModal}
        message="لطفاً اطلاعات دسته‌بندی را وارد کنید"
        title="ایجاد دسته‌بندی جدید"
        confirmMsg="ثبت"
        refetch={refetch}
      />
    </DashboardPanel>
  );
}

export default CategoriesListsPage;
