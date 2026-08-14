import NotFoundLayout from '@/components/global/error/NotFoundLayout';

export default function NotFound({ error }: { error: Error }) {
  return <NotFoundLayout title="متاسفانه ویدیویی یافت نشد" desc="متاسفانه ویدیویی یافت نشد" error={error} />;
}
