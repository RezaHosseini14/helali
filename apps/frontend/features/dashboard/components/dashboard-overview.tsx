'use client';

import dynamic from 'next/dynamic';

import DashboardItem from '@/components/pages/dashboard/DashboardItem';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardOverview } from '@/features/dashboard/hooks/use-dashboard-overview';
import { getApiErrorMessage } from '@/services/get-api-error-message';

const DashboardAnalytics = dynamic(
  () =>
    import('@/features/dashboard/components/dashboard-analytics').then(
      (module) => module.DashboardAnalytics,
    ),
  {
    loading: () => <Skeleton className="h-96 w-full rounded-2xl" />,
    ssr: false,
  },
);

function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6 p-0.5 sm:space-y-8 sm:p-1">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-2xl sm:h-24" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-2xl sm:h-96" />
    </div>
  );
}

export default function DashboardOverview() {
  const { data, isPending, isError, error, refetch } = useDashboardOverview();

  if (isPending) {
    return <DashboardOverviewSkeleton />;
  }

  if (isError || !data) {
    const description = isError
      ? getApiErrorMessage(error)
      : 'پاسخی از سرور دریافت نشد.';

    return (
      <div className="p-1">
        <ErrorState
          title="خطا در دریافت آمار"
          description={description}
          onRetry={() => {
            void refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-0.5 sm:space-y-8 sm:p-1">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        <DashboardItem
          color="#0f766e"
          icon="solar:users-group-two-rounded-bold-duotone"
          title="تعداد کاربران"
          count={data.users}
        />
        <DashboardItem
          color="#1d4ed8"
          icon="solar:music-notes-bold-duotone"
          title="تعداد صوت‌ها"
          count={data.audios}
        />
        <DashboardItem
          color="#5b21b6"
          icon="solar:videocamera-record-bold-duotone"
          title="تعداد ویدیو‌ها"
          count={data.videos}
        />
        <DashboardItem
          color="#b45309"
          icon="solar:gallery-minimalistic-bold-duotone"
          title="تعداد تصاویر"
          count={data.galleries}
        />
        <DashboardItem
          color="#be123c"
          icon="solar:chat-line-bold-duotone"
          title="تعداد نظرات"
          count={data.comments}
        />
        <DashboardItem
          color="#15803d"
          icon="solar:eye-bold-duotone"
          title="بازدید صوت"
          count={data.totalAudioViews}
        />
        <DashboardItem
          color="#0e7490"
          icon="solar:videocamera-bold-duotone"
          title="بازدید ویدیو"
          count={data.totalVideoViews}
        />
        <DashboardItem
          color="#334155"
          icon="solar:heart-bold-duotone"
          title="مجموع لایک"
          count={data.totalLikes}
        />
      </div>

      <DashboardAnalytics />
    </div>
  );
}
