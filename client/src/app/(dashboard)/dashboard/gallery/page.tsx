'use client';
import DashboardPanel from '@/components/global/DashboardPanel';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Table } from 'rsuite';
import { deleteImage } from 'services/gallery/galleryServices';
import { allImage } from 'services/image/imageServices';
import { getFileSize } from 'utils/functions';
import ConfirmModal from '@/components/global/ConfirmModal';

const { Column, HeaderCell, Cell } = Table;

function GalleryPage() {
  const { data, isLoading, refetch } = useQuery({ queryKey: ['allImage'], queryFn: allImage });
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['deleteImage'],
    mutationFn: (id: number) => deleteImage(id),
  });

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
        toast.success('فایل تصویری با موفقیت حذف شد');
      } else {
        toast.error('فایل تصویری حذف نشد');
      }
    } catch (error) {
      toast.error('فایل تصویری حذف نشد');
    } finally {
      closeConfirmModal();
    }
  };

  return (
    <DashboardPanel title="لیست تصاویر">
      <Table bordered autoHeight data={data?.data?.images} loading={isLoading}>
        <Column width={60} align="center" fixed>
          <HeaderCell>شناسه</HeaderCell>
          <Cell dataKey="id" />
        </Column>

        <Column flexGrow={1} align="center" fixed>
          <HeaderCell>توضیحات</HeaderCell>
          <Cell dataKey="desc" />
        </Column>

        <Column flexGrow={1}>
          <HeaderCell>نام فایل</HeaderCell>
          <Cell dataKey="originalName" />
        </Column>

        <Column flexGrow={1}>
          <HeaderCell>نوع فایل</HeaderCell>
          <Cell dataKey="mimetype" />
        </Column>

        <Column flexGrow={1}>
          <HeaderCell>حجم</HeaderCell>
          <Cell>{(rowData: any) => <span dir="ltr">{getFileSize(rowData.size)}</span>}</Cell>
        </Column>

        <Column width={70}>
          <HeaderCell>لایک</HeaderCell>
          <Cell dataKey="like" />
        </Column>

        <Column width={70}>
          <HeaderCell>بازدید</HeaderCell>
          <Cell dataKey="view" />
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

      <ConfirmModal
        open={showConfirm}
        onClose={closeConfirmModal}
        title="تأیید حذف"
        message="آیا مطمئن هستید که می‌خواهید این فایل تصویری را حذف کنید؟"
        closeConfirmModal={closeConfirmModal}
        loading={isPending}
        confirmMsg="حذف"
        handleDelete={handleDelete}
      />
    </DashboardPanel>
  );
}

export default GalleryPage;
