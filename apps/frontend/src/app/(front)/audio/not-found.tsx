import NotFoundLayout from '@/components/global/error/NotFoundLayout';

export default function NotFound({ error }: { error: Error }) {
  return <NotFoundLayout title="متاسفانه صوتی یافت نشد" desc="متاسفانه صوتی یافت نشد" error={error} />;
}
