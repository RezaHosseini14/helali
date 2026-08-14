'use client';

import { useMemo, useRef, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';
import { StarIcon } from 'lucide-react';
import toast from 'react-hot-toast';

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
import CreateGalleryModal from '@/components/pages/dashboard/gallery/CreateGallery.modal';
import { Button } from '@/components/ui/button';
import { galleryKeys } from '@/features/gallery/hooks/gallery-keys';
import { getApiErrorMessage } from '@/services/get-api-error-message';
import { deleteImage, setImageFeatured } from 'services/gallery/galleryServices';
import { allImage } from 'services/image/imageServices';

interface IGalleryRow {
  id: number;
  desc: string;
  originalName: string;
  mimetype: string;
  size: number;
  like: number;
  view: number;
  isFeatured: boolean;
}

const columnHelper = createColumnHelper<DataTableFeatures, IGalleryRow>();

function GalleriesListsPage() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const clearSelectionRef = useRef<(() => void) | null>(null);

  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['allImage', { page, limit }],
    queryFn: ({ queryKey }: { queryKey: [string, { page: number; limit: number }] }) => {
      const [, params] = queryKey;
      return allImage(params.page, params.limit);
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['deleteImage'],
    mutationFn: (id: number) => deleteImage(id),
  });

  const featuredMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: number; isFeatured: boolean }) => {
      await setImageFeatured(id, isFeatured);
      await Promise.all([
        refetch(),
        queryClient.invalidateQueries({ queryKey: galleryKeys.featured() }),
      ]);
      return { id, isFeatured };
    },
    onSuccess: (_result, variables) => {
      toast.success(
        variables.isFeatured ? 'تصویر به اسلایدر منتخب اضافه شد' : 'تصویر از اسلایدر منتخب برداشته شد',
      );
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error) || 'تغییر وضعیت اسلایدر انجام نشد');
    },
  });

  const bulkFeaturedMutation = useMutation({
    mutationFn: async ({
      ids,
      isFeatured,
    }: {
      ids: ReadonlyArray<number>;
      isFeatured: boolean;
    }) => {
      await Promise.all(ids.map((id) => setImageFeatured(id, isFeatured)));
      await Promise.all([
        refetch(),
        queryClient.invalidateQueries({ queryKey: galleryKeys.featured() }),
      ]);
      return { ids, isFeatured };
    },
    onSuccess: (result) => {
      toast.success(
        result.isFeatured
          ? `${result.ids.length} تصویر به اسلایدر منتخب اضافه شد`
          : `${result.ids.length} تصویر از اسلایدر منتخب برداشته شد`,
      );
      clearSelectionRef.current?.();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error) || 'تغییر وضعیت اسلایدر انجام نشد');
    },
  });

  const isFeatureActionPending =
    featuredMutation.isPending || bulkFeaturedMutation.isPending;
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
        void queryClient.invalidateQueries({ queryKey: galleryKeys.featured() });
        clearSelectionRef.current?.();
        toast.success(
          selectedIds.length > 1
            ? `${selectedIds.length} فایل تصویری با موفقیت حذف شد`
            : 'فایل تصویری با موفقیت حذف شد',
        );
      } else {
        toast.error('فایل تصویری حذف نشد');
      }
    } catch {
      toast.error('فایل تصویری حذف نشد');
    } finally {
      handleCloseConfirmModal();
    }
  }

  const images: IGalleryRow[] = (data?.data?.images ?? []).map((image) => ({
    ...image,
    size: Number(image.size) || 0,
    like: Number(image.like) || 0,
    view: Number(image.view) || 0,
    isFeatured: Boolean(image.isFeatured),
  }));
  const imagesById = useMemo(
    () => new Map(images.map((image) => [image.id, image])),
    [images],
  );
  const totalItems = data?.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalItems / limit) || 1);

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor('id', {
          ...dataTableIdColumnDefaults,
          cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
        }),
        columnHelper.accessor('desc', {
          header: 'توضیحات',
          cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
        }),
        columnHelper.accessor('originalName', {
          header: 'نام فایل',
          cell: ({ getValue }) => (
            <span dir="ltr">{getValue()}</span>
          ),
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
        columnHelper.display({
          ...dataTableActionsColumnDefaults,
          cell: ({ row }) => {
            const isFeatured = Boolean(row.original.isFeatured);
            const isRowFeaturing =
              featuredMutation.isPending && featuredMutation.variables?.id === row.original.id;

            return (
              <div className="inline-flex items-center justify-center gap-1">
                <IconButton
                  className={
                    isFeatured
                      ? 'create-btn'
                      : 'grid size-7 shrink-0 place-content-center rounded-md bg-primary/10 text-sm text-primary'
                  }
                  icon={isRowFeaturing ? 'ki-outline ki-loading animate-spin' : isFeatured ? 'ki-solid ki-star' : 'ki-outline ki-star'}
                  onClick={() => {
                    featuredMutation.mutate({
                      id: row.original.id,
                      isFeatured: !isFeatured,
                    });
                  }}
                  tooltipText={isFeatured ? 'حذف از اسلایدر منتخب' : 'افزودن به اسلایدر منتخب'}
                  disabled={isFeatureActionPending}
                />
                <IconButton
                  className="trash-btn"
                  icon="ki-solid ki-trash"
                  onClick={() => handleOpenConfirmModal(row.original.id)}
                  tooltipText="حذف فایل تصویری"
                />
              </div>
            );
          },
        }),
      ]),
    [featuredMutation, isFeatureActionPending],
  );

  return (
    <DashboardPanel
      title="لیست تصاویر"
      buttons={[
        {
          icon: 'ki-solid ki-plus-square',
          title: 'ایجاد تصویر',
          onClick: () => setShowCreate(true),
        },
      ]}
    >
      <DataTable
        columns={columns}
        data={images}
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
        isBulkDeleting={isPending || bulkFeaturedMutation.isPending}
        onBulkDelete={(ids, clearSelection) => {
          clearSelectionRef.current = clearSelection;
          setSelectedIds(ids.map(Number));
          setShowConfirm(true);
        }}
        renderBulkActions={({ selectedIds: selectedRowIds, clearSelection }) => {
          const ids = selectedRowIds.map(Number);
          const selectedRows = ids
            .map((id) => imagesById.get(id))
            .filter((row): row is IGalleryRow => Boolean(row));
          const shouldFeature = selectedRows.some((row) => !row.isFeatured);
          const isBusy = isFeatureActionPending || isPending;

          return (
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={bulkFeaturedMutation.isPending}
              disabled={isBusy || selectedRows.length === 0}
              onClick={() => {
                clearSelectionRef.current = clearSelection;
                bulkFeaturedMutation.mutate({
                  ids,
                  isFeatured: shouldFeature,
                });
              }}
            >
              {bulkFeaturedMutation.isPending ? null : (
                <StarIcon className={shouldFeature ? undefined : 'fill-current'} />
              )}
              {shouldFeature ? 'افزودن به اسلایدر منتخب' : 'حذف از اسلایدر منتخب'}
            </Button>
          );
        }}
      />

      <ConfirmModal
        open={showConfirm}
        onClose={handleCloseConfirmModal}
        title="تأیید حذف"
        message={
          selectedIds.length > 1
            ? `آیا مطمئن هستید که می‌خواهید ${selectedIds.length} فایل تصویری انتخاب‌شده را حذف کنید؟`
            : 'آیا مطمئن هستید که می‌خواهید این فایل تصویری را حذف کنید؟'
        }
        loading={isPending}
        confirmMsg="حذف"
        handleDelete={handleDelete}
      />

      <CreateGalleryModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        refetch={refetch}
      />
    </DashboardPanel>
  );
}

export default GalleriesListsPage;
