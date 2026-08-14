import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-mainstructure p-8 text-white">
      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="potk mb-2 text-7xl font-bold sm:text-8xl">404</p>
        <p className="mb-8 border-b border-white/25 pb-4 text-base text-white/85 sm:text-lg">
          متاسفانه صفحه مورد نظر یافت نشد
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-mainstructure transition hover:bg-white/90"
        >
          <i className="ki-solid ki-arrow-right" />
          <span>بازگشت به صفحه اصلی</span>
        </Link>
      </div>
      <i className="ki-outline ki-cross absolute top-1/2 right-1/2 z-0 -translate-y-1/2 translate-x-1/2 text-[70rem] text-white/5" />
    </div>
  );
}
