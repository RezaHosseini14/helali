'use client';

import SyntaxError from '@/components/global/error/SyntaxError';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <SyntaxError
      title="مشکلی پیش آمده"
      desc="متاسفانه مشکلی پیش آمده است. لطفاً دوباره تلاش کنید."
      error={error}
      reset={reset}
    />
  );
}
