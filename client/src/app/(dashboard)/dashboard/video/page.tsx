'use client';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Table } from 'rsuite';

// Services
import { deleteImage } from 'services/gallery/galleryServices';

//Functions
import { getFileSize, shamsi } from 'utils/functions';

//Components
import ConfirmModal from '@/components/global/ConfirmModal';
import DashboardPanel from '@/components/global/DashboardPanel';
import IconButton from '@/components/global/IconButton';
import { allVideo } from 'services/video/videoServices';
import TablePagination from '@/components/global/TablePagination';

const { Column, HeaderCell, Cell } = Table;

function videosListsPage() {
  const router = useRouter();

  // ---------------------- State and Ref ----------------------
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // ---------------------- Data Fetching ----------------------
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['allvideo', { page, limit }],
    queryFn: ({ queryKey }: { queryKey: [string, { page: number; limit: number }] }) => {
      const [, params] = queryKey;
      return allVideo(params.page, params.limit);
    },
  });

  // ---------------------- Mutations ----------------------
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['deleteImage'],
    mutationFn: (id: number) => deleteImage(id),
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
    <DashboardPanel title="لیست ویدیو‌ها">
      <TablePagination
        page={page}
        limit={limit}
        total={data?.data?.total}
        setPage={setPage}
        handleChangeLimit={handleChangeLimit}
      >
        <Table bordered autoHeight data={data?.data?.videos} loading={isLoading}>
          <Column width={60} align="center" fixed>
            <HeaderCell>شناسه</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column flexGrow={1} align="center" fixed>
            <HeaderCell>توضیحات</HeaderCell>
            <Cell dataKey="text" />
          </Column>

          <Column flexGrow={1}>
            <HeaderCell>نام فایل</HeaderCell>
            <Cell dataKey="originalName" />
          </Column>

          <Column width={100}>
            <HeaderCell>نوع فایل</HeaderCell>
            <Cell dataKey="mimetype" />
          </Column>

          <Column width={90}>
            <HeaderCell>حجم</HeaderCell>
            <Cell>{(rowData: any) => <span dir="ltr">{getFileSize(rowData.size)}</span>}</Cell>
          </Column>

          <Column width={50}>
            <HeaderCell>لایک</HeaderCell>
            <Cell dataKey="like" />
          </Column>

          <Column width={50}>
            <HeaderCell>بازدید</HeaderCell>
            <Cell dataKey="view" />
          </Column>

          <Column width={100}>
            <HeaderCell>تاریخ ایجاد</HeaderCell>
            <Cell>{(rowData: any) => <span>{shamsi(rowData.created_at, 'YYYY/MM/DD')}</span>}</Cell>
          </Column>

          <Column width={85} fixed="right">
            <HeaderCell> </HeaderCell>
            <Cell>
              {(rowData) => (
                <div className="flex items-center gap-2">
                  <IconButton
                    className="update-btn"
                    icon="ki-solid ki-pencil"
                    onClick={() => router.replace(`/dashboard/gallery/update/${rowData.id}`)}
                    tooltipText="بروزرسانی"
                  />
                  <IconButton
                    className="trash-btn"
                    icon="ki-solid ki-trash"
                    onClick={() => handleOpenConfirmModal(rowData.id)}
                    tooltipText="حذف فایل ویدیویی"
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
        message="آیا مطمئن هستید که می‌خواهید این فایل تصویری را حذف کنید؟"
        closeConfirmModal={handleCloseConfirmModal}
        loading={isPending}
        confirmMsg="حذف"
        handleDelete={handleDelete}
      />
    </DashboardPanel>
  );
}

export default videosListsPage;
