'use client';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Table } from 'rsuite';

// Functions
import { shamsi } from 'utils/functions';

// Services
import { deleteCategory, allCategory } from 'services/category/categoryServices';
import { updateCommentStatus } from 'services/comment/commentServices';
import { allAudioComments } from 'services/audio/audioServices';

// Components
import ConfirmModal from '@/components/global/ConfirmModal';
import DashboardPanel from '@/components/global/DashboardPanel';
import IconButton from '@/components/global/IconButton';
import TablePagination from '@/components/global/TablePagination';
import CreateCategoryModal from '@/components/pages/dashboard/category/CreateCategory.modal';
import UpdateCategoryModal from '@/components/pages/dashboard/category/UpdateCategory.modal';

const { Column, HeaderCell, Cell } = Table;

function CommentsListsPage() {
  // ---------------------- State and Ref ----------------------
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  // ---------------------- Data Fetching ----------------------
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['allAudioComments'],
    queryFn: () => {
      return allAudioComments();
    },
  });
  console.log(isFetching);

  // ---------------------- Mutations ----------------------
  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['updateCommentStatus'],
    mutationFn: ({ commentType, commentId, body }: { commentType: string; commentId: number; body: any }) =>
      updateCommentStatus(commentType, commentId, body),
  });

  // ---------------------- Event Handlers ----------------------

  const handleChangeLimit = (dataKey: any) => {
    setPage(1);
    setLimit(dataKey);
  };

  const handleChangeStatus = async (commentType: string, commentId: number, body: any) => {
    try {
      const res = await mutateAsync({ commentType, commentId, body });
      if (res.status === 200) {
        refetch();
        toast.success('نظر منتشر شد');
      } else {
        toast.success('نظر منتشر نشد');
      }
    } catch (error) {
      toast.error('خطا در انتشاد نظر');
    }
  };

  // ---------------------- Rendering ----------------------
  return (
    <DashboardPanel title="لیست نظرات">
      <TablePagination
        page={page}
        limit={limit}
        total={data?.data?.total}
        setPage={setPage}
        handleChangeLimit={handleChangeLimit}
      >
        <Table bordered autoHeight data={data?.data?.comments} loading={isLoading || isFetching}>
          <Column width={60} align="center">
            <HeaderCell>شناسه</HeaderCell>
            <Cell dataKey="id" />
          </Column>

          <Column flexGrow={1} align="center">
            <HeaderCell>نویسنده</HeaderCell>
            <Cell dataKey="author" />
          </Column>

          <Column flexGrow={1} align="center">
            <HeaderCell>دیدگاه</HeaderCell>
            <Cell dataKey="text" />
          </Column>

          <Column flexGrow={1} align="center">
            <HeaderCell>وضعیت انتشار</HeaderCell>
            <Cell dataKey="status" />
          </Column>

          <Column width={100}>
            <HeaderCell>تاریخ آخرین بروزرسانی</HeaderCell>
            <Cell>{(rowData: any) => <span>{shamsi(rowData.updated_at, 'YYYY/MM/DD')}</span>}</Cell>
          </Column>

          <Column width={100}>
            <HeaderCell>تاریخ ایجاد</HeaderCell>
            <Cell>{(rowData: any) => <span>{shamsi(rowData.created_at, 'YYYY/MM/DD')}</span>}</Cell>
          </Column>

          <Column width={85}>
            <HeaderCell> </HeaderCell>
            <Cell>
              {(rowData) => (
                <div className="flex items-center gap-2">
                  <>
                    {(rowData.status === 'pending' || rowData.status === 'rejected') && (
                      <>
                        <IconButton
                          className="create-btn"
                          icon="ki-solid ki-check"
                          onClick={() => handleChangeStatus('audio', rowData?.id, { newStatus: 'published' })}
                          tooltipText="انتشار"
                        />
                        <IconButton
                          disabled={true}
                          className="trash-btn"
                          icon="ki-solid ki-cross"
                          onClick={() => handleChangeStatus('audio', rowData?.id, { newStatus: 'rejected' })}
                          tooltipText="رد کردن"
                        />
                      </>
                    )}

                    {(rowData.status === 'pending' || rowData.status === 'published') && (
                      <>
                        <IconButton
                          disabled={true}
                          className="create-btn"
                          icon="ki-solid ki-check"
                          onClick={() => handleChangeStatus('audio', rowData?.id, { newStatus: 'published' })}
                          tooltipText="انتشار"
                        />
                        <IconButton
                          className="trash-btn"
                          icon="ki-solid ki-cross"
                          onClick={() => handleChangeStatus('audio', rowData?.id, { newStatus: 'rejected' })}
                          tooltipText="رد کردن"
                        />
                      </>
                    )}
                  </>
                </div>
              )}
            </Cell>
          </Column>
        </Table>
      </TablePagination>
    </DashboardPanel>
  );
}

export default CommentsListsPage;
