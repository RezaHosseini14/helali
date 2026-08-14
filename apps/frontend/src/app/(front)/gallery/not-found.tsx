import NotFoundLayout from '@/components/global/error/NotFoundLayout';

export default function NotFound({ error }: { error: Error }) {
  return <NotFoundLayout title="متاسفانه تصویری یافت نشد" desc="متاسفانه تصویری یافت نشد" error={error} />;
}
