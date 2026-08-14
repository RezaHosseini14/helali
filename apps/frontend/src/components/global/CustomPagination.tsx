'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { AppPagination } from '@/components/global/TablePagination';

interface ICustomPaginationProps {
  readonly activePage: number;
  readonly total: number;
  readonly limit: number;
}

function CustomPagination(props: ICustomPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/video?${params.toString()}`);
  };

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <AppPagination
        className="sp_pagination justify-center"
        activePage={props.activePage}
        total={props.total}
        limit={props.limit}
        onChangePage={goToPage}
      />
    </div>
  );
}

export default CustomPagination;
