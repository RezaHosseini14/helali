'use server';

import { cookies } from 'next/headers';

// Components
import DashboardItem from '@/components/pages/dashboard/DashboardItem';

export default async function DashboardPage() {
  try {
    const accessToken = (await cookies()).get('accessToken')?.value;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/all-data-count`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Failed to fetch data');

    const data = await res.json();

    return (
      <div className="grid md:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 grid-rows-12 gap-4 h-full">
        <DashboardItem icon="solar:users-group-two-rounded-bold-duotone" title="تعداد کاربران" count={data.users} />
        <DashboardItem icon="solar:music-notes-bold-duotone" title="تعداد صوت‌ها" count={data.audios} />
        <DashboardItem icon="solar:videocamera-record-bold-duotone" title="تعداد ویدیو‌ها" count={data.videos} />
        <DashboardItem icon="solar:gallery-minimalistic-bold-duotone" title="تعداد تصاویر" count={data.galleries} />
        <DashboardItem icon="solar:chat-line-bold-duotone" title="تعداد نظرات" count={data.comments} />
      </div>
    );
  } catch (error) {
    console.error('خطا در دریافت اطلاعات:', error);
    return (
      <div className="grid place-content-center h-full">
        <p className="text-red-500">خطا در دریافت اطلاعات !!</p>
      </div>
    );
  }
}
