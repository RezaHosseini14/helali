import Link from 'next/link';

function NotFoundLayout({ error, title, desc }: { error: Error; title: string; desc: string }) {
  return (
    <div className="h-[calc(100vh-10rem)] grid place-content-center">
      <div className="flex flex-col gap-4 items-center justify-center p-5 bg-red-100 text-red-700 rounded-2xl px-4 w-fit min-w-80">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p>{desc}</p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 bg-white/70 hover:bg-white transition backdrop-blur-2xl text-red-700 font-bold px-2 py-1 rounded-lg"
        >
          <i className="ki-solid ki-arrow-right"></i>
          <span>بازگشت به صفحه اصلی</span>
        </Link>
      </div>
    </div>
  );
}

export default NotFoundLayout;
