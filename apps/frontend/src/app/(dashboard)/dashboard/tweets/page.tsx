'use client';

import { useMemo, useState } from 'react';

import { createColumnHelper } from '@tanstack/react-table';
import { ExternalLinkIcon } from 'lucide-react';

import {
  DataTable,
  DataTableActionSlot,
  DataTableActions,
  dataTableActionsColumnDefaults,
  dataTableIdColumnDefaults,
  type DataTableFeatures,
} from '@/components/data-table';
import DashboardPanel from '@/components/global/DashboardPanel';
import IconButton from '@/components/global/IconButton';
import { Badge } from '@/components/ui/badge';
import {
  useAdminTweets,
  useTweetPublishedMutation,
} from '@/features/tweets/hooks/use-admin-tweets';
import { cn } from '@/lib/utils';
import { shamsi } from 'utils/functions';

interface ITweetRow {
  id: number;
  username: string;
  text: string;
  link: string;
  hasVideo: boolean;
  likeCount: number;
  replyCount: number;
  retweetCount: number;
  publishedAt: string;
  isPublished: boolean;
}

const columnHelper = createColumnHelper<DataTableFeatures, ITweetRow>();

function TweetPublishedBadge({ isPublished }: { readonly isPublished: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'mx-auto h-7 max-w-full gap-1 truncate rounded-full px-2 text-[11px] font-semibold',
        isPublished
          ? 'border-primary/35 bg-primary/10 text-primary'
          : 'border-muted-foreground/35 bg-muted text-muted-foreground',
      )}
    >
      <i
        className={cn(
          'text-sm',
          isPublished ? 'ki-outline ki-eye' : 'ki-outline ki-eye-slash',
        )}
      />
      {isPublished ? 'نمایش در سایت' : 'مخفی'}
    </Badge>
  );
}

function truncateText(text: string, maxLength = 120): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}

function TweetsListsPage() {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useAdminTweets(page, limit);
  const publishedMutation = useTweetPublishedMutation(page, limit);

  const tweets: ITweetRow[] = (data?.items ?? []).map((tweet) => ({
    id: tweet.id,
    username: tweet.username,
    text: tweet.text,
    link: tweet.link,
    hasVideo: Boolean(tweet.hasVideo),
    likeCount: tweet.likeCount,
    replyCount: tweet.replyCount,
    retweetCount: tweet.retweetCount,
    publishedAt: tweet.publishedAt,
    isPublished: Boolean(tweet.isPublished),
  }));

  const totalItems = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalItems / limit) || 1);

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor('id', {
          ...dataTableIdColumnDefaults,
          cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
        }),
        columnHelper.accessor('username', {
          header: 'کاربر',
          cell: ({ getValue }) => (
            <span dir="ltr" className="text-sm text-muted-foreground">
              @{getValue()}
            </span>
          ),
        }),
        columnHelper.accessor('text', {
          header: 'متن',
          cell: ({ getValue }) => (
            <p className="max-w-md text-sm leading-relaxed">{truncateText(getValue())}</p>
          ),
        }),
        columnHelper.accessor('hasVideo', {
          header: 'ویدیو',
          cell: ({ getValue }) => (
            <div className="text-center text-sm">{getValue() ? 'بله' : '—'}</div>
          ),
        }),
        columnHelper.accessor('likeCount', {
          header: 'لایک',
          cell: ({ getValue }) => (
            <div className="text-center text-sm">{getValue().toLocaleString('fa-IR')}</div>
          ),
        }),
        columnHelper.accessor('replyCount', {
          header: 'پاسخ',
          cell: ({ getValue }) => (
            <div className="text-center text-sm">{getValue().toLocaleString('fa-IR')}</div>
          ),
        }),
        columnHelper.accessor('retweetCount', {
          header: 'ری‌توییت',
          cell: ({ getValue }) => (
            <div className="text-center text-sm">{getValue().toLocaleString('fa-IR')}</div>
          ),
        }),
        columnHelper.accessor('publishedAt', {
          header: 'تاریخ انتشار',
          cell: ({ getValue }) => shamsi(getValue(), 'YYYY/MM/DD'),
        }),
        columnHelper.accessor('isPublished', {
          header: 'وضعیت نمایش',
          cell: ({ getValue }) => <TweetPublishedBadge isPublished={getValue()} />,
        }),
        columnHelper.display({
          ...dataTableActionsColumnDefaults,
          cell: ({ row }) => {
            const { id, isPublished, link } = row.original;
            const isRowUpdating =
              publishedMutation.isPending && publishedMutation.variables?.id === id;

            return (
              <DataTableActions>
                <DataTableActionSlot>
                  <IconButton
                    className={isPublished ? 'update-btn' : 'create-btn'}
                    icon={
                      isRowUpdating
                        ? 'ki-outline ki-loading animate-spin'
                        : isPublished
                          ? 'ki-solid ki-eye-slash'
                          : 'ki-solid ki-eye'
                    }
                    onClick={() => {
                      publishedMutation.mutate({ id, isPublished: !isPublished });
                    }}
                    tooltipText={isPublished ? 'مخفی کردن از سایت' : 'نمایش در سایت'}
                    disabled={publishedMutation.isPending}
                  />
                </DataTableActionSlot>
                <DataTableActionSlot>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid size-7 shrink-0 place-content-center rounded-md bg-muted text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                    title="مشاهده در X"
                  >
                    <ExternalLinkIcon className="size-3.5" />
                  </a>
                </DataTableActionSlot>
              </DataTableActions>
            );
          },
        }),
      ]),
    [publishedMutation.isPending, publishedMutation.variables?.id],
  );

  return (
    <DashboardPanel title="مدیریت توییت‌ها">
      <DataTable
        columns={columns}
        data={tweets}
        isLoading={isLoading || isFetching}
        page={page}
        pageSize={limit}
        pageCount={pageCount}
        totalItems={totalItems}
        onPageChange={setPage}
        onPageSizeChange={(nextLimit) => {
          setPage(1);
          setLimit(nextLimit);
        }}
        pageSizeOptions={[5, 10, 20]}
      />
    </DashboardPanel>
  );
}

export default TweetsListsPage;
