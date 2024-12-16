'use client';
import React, { useState } from 'react';
import DashboardPanel from '@/components/global/DashboardPanel';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Table } from 'rsuite';
import { allAudio, deleteAudio } from 'services/audio/audioServices';
import { getFileSize, shamsi } from 'utils/functions';
import ConfirmModal from '@/components/global/ConfirmModal';
import { useRouter } from 'next/navigation';

const { Column, HeaderCell, Cell } = Table;

function AudioPage() {
  const { data, isLoading, refetch } = useQuery({ queryKey: ['allAudio'], queryFn: allAudio });
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['deleteAudio'],
    mutationFn: (id: number) => deleteAudio(id),
  });

  const router = useRouter();

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
      closeConfirmModal();
    }
  };

  return (
    <DashboardPanel title="لیست صوت ها">
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

        <Column width={70} fixed="right">
          <HeaderCell> </HeaderCell>
          <Cell>
            {(rowData) => (
              <div className="flex items-center gap-2">
                <div className="grid place-content-center">
                  <i
                    className="ki-solid ki-pencil cursor-pointer text-maincolor w-fit"
                    onClick={() => router.replace(`/dashboard/audio/update/${rowData.id}`)}
                  ></i>
                </div>
                <div className="grid place-content-center">
                  <i
                    className="ki-solid ki-trash cursor-pointer text-red-500 w-fit"
                    onClick={() => openConfirmModal(rowData.id)}
                  ></i>
                </div>
              </div>
            )}
          </Cell>
        </Column>
      </Table>

      <ConfirmModal
        open={showConfirm}
        onClose={closeConfirmModal}
        title="تأیید حذف"
        message="آیا مطمئن هستید که می‌خواهید این فایل صوتی را حذف کنید؟"
        closeConfirmModal={closeConfirmModal}
        loading={isPending}
        confirmMsg="حذف"
        handleDelete={handleDelete}
      />
    </DashboardPanel>
  );
}

export default AudioPage;
