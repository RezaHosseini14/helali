import { ReactNode } from 'react';
import { Pagination } from 'rsuite';

type TablePaginationPropsType = {
  children: ReactNode;
  total: number;
  limit: number;
  page: number;
  setPage: any;
  handleChangeLimit: any;
};
function TablePagination(props: TablePaginationPropsType) {
  return (
    <>
      {props.children}
      <div className="pt-4">
        <Pagination
          prev
          next
          first
          last
          ellipsis
          boundaryLinks
          maxButtons={5}
          size="xs"
          layout={['total', '-', 'limit', '|', 'pager']}
          total={props.total}
          limitOptions={[1, 5, 10]}
          limit={props.limit}
          activePage={props.page}
          onChangePage={props.setPage}
          onChangeLimit={props.handleChangeLimit}
        />
      </div>
    </>
  );
}

export default TablePagination;
