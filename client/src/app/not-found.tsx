import Link from 'next/link';

// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="h-screen bg-mainColor p-8 text-white">
      <div className="flex flex-col justify-center items-center h-full !z-50 relative">
        <h1 className="text-8xl font-bold">404</h1>
        <p className="text-lg border-b pb-4 mb-4">متاسفانه صفحه مورد نظر یافت نشد</p>
        <Link href="/home" className="flex items-center gap-2">
          <i className="ki-solid ki-arrow-right"></i>
          <span>بازگشت به صفحه اصلی</span>
        </Link>
      </div>
      <i className="ki-outline ki-cross z-0 text-white/5 text-[70rem] absolute right-1/2 translate-x-1/2 top-1/2 -translate-y-1/2"></i>
    </div>
  );
}

{
  /* <div className="flex flex-col h-screen bg-mainColor p-8">
  <div className="flex flex-col justify-between items-start h-full">
    <div className="text-white">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-sm">متاسفانه صفحه مورد نظر یافت نشد</p>
    </div>
    <Link href="/home" className="text-white flex items-center gap-2">
      <i className="ki-solid ki-arrow-right"></i>
      <span>بازگشت به صفحه اصلی</span>
    </Link>

    <i className="ki-outline ki-cross text-white/5 text-[40rem] absolute right-1/2 translate-x-1/2 top-1/2 -translate-y-1/2"></i>
  </div>
</div>; */
}
