'use client';

import DashboardItem from '@/components/pages/dashboard/DashboardItem';
import { useDashboardOverview } from '@/features/dashboard/hooks/use-dashboard-overview';
import { BRAND_COLORS } from '@/lib/brand';

export default function DashboardOverview() {
  const { data, isLoading, isError } = useDashboardOverview();

  if (isLoading) {
    return <div className="p-4">در حال بارگذاری...</div>;
  }

  if (isError || !data) {
    return <div className="p-4">خطا در دریافت آمار</div>;
  }

  return (
    <div className="grid md:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 grid-rows-12 gap-4 h-full">
      <DashboardItem
        color={BRAND_COLORS.primary}
        icon="solar:users-group-two-rounded-bold-duotone"
        title="تعداد کاربران"
        count={data.users}
      />
      <DashboardItem
        color="#2a8f96"
        icon="solar:music-notes-bold-duotone"
        title="تعداد صوت‌ها"
        count={data.audios}
      />
      <DashboardItem
        color="#1a6f78"
        icon="solar:videocamera-record-bold-duotone"
        title="تعداد ویدیو‌ها"
        count={data.videos}
      />
      <DashboardItem
        color={BRAND_COLORS.accent}
        icon="solar:gallery-minimalistic-bold-duotone"
        title="تعداد تصاویر"
        count={data.galleries}
      />
      <DashboardItem
        color={BRAND_COLORS.accentHover}
        icon="solar:chat-line-bold-duotone"
        title="تعداد نظرات"
        count={data.comments}
      />
    </div>
  );
}
