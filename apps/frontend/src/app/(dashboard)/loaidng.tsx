import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm">
      <Spinner className="size-10 text-primary" />
      <p className="text-lg font-bold">درحال بارگذاری</p>
    </div>
  );
}
