'use client';
import React, { useState } from 'react';
import DashboardPanel from '@/components/global/DashboardPanel';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Pagination, Table } from 'rsuite';
import { useRouter } from 'next/navigation';

// Services
import { allAudio, deleteAudio } from 'services/audio/audioServices';

//Functions
import { getFileSize, shamsi } from 'utils/functions';

//Components
import ConfirmModal from '@/components/global/ConfirmModal';
import IconButton from '@/components/global/IconButton';
import TablePagination from '@/components/global/TablePagination';

const { Column, HeaderCell, Cell } = Table;

function AudiosListsPage() {
  const router = useRouter();

  // ---------------------- State and Ref ----------------------
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // ---------------------- Data Fetching ----------------------
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['allAudio', { page, limit }],
    queryFn: ({ queryKey }: { queryKey: [string, { page: number; limit: number }] }) => {
      const [, params] = queryKey;
      return allAudio(params.page, params.limit);
    },
  });

  // ---------------------- Mutations ----------------------
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['deleteAudio'],
    mutationFn: (id: number) => deleteAudio(id),
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
        toast.success('فایل صوتی با موفقیت حذف شد');
      } else {
        toast.error('فایل صوتی حذف نشد');
      }
    } catch (error) {
      toast.error('خطا در حذف فایل صوتی');
    } finally {
      handleCloseConfirmModal();
    }
  };

  // ---------------------- Rendering ----------------------
  return (
    <DashboardPanel title="لیست صوت ها">
      <TablePagination
        page={page}
        limit={limit}
        total={data?.data?.total}
        setPage={setPage}
        handleChangeLimit={handleChangeLimit}
      >
        <Table autoHeight data={data?.data?.audios} loading={isLoading} bordered>
          <Column width={60} align="center">
            <HeaderCell>شناسه</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column flexGrow={1} align="center">
            <HeaderCell>عنوان</HeaderCell>
            <Cell dataKey="title" />
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
                    onClick={() => router.replace(`/dashboard/audio/update/${rowData.id}`)}
                    tooltipText="بروزرسانی"
                  />
                  <IconButton
                    className="trash-btn"
                    icon="ki-solid ki-trash"
                    onClick={() => handleOpenConfirmModal(rowData.id)}
                    tooltipText="حذف فایل صوتی"
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
        message="آیا مطمئن هستید که می‌خواهید این فایل صوتی را حذف کنید؟"
        loading={isPending}
        confirmMsg="حذف"
        handleDelete={handleDelete}
      />
    </DashboardPanel>
  );
}

export default AudiosListsPage;
