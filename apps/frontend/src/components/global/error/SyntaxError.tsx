import React from 'react';

function SyntaxError({ error, reset, title, desc }: { error: Error; reset: () => void; title: string; desc: string }) {
  return (
    <div className="h-[calc(100vh-10rem)] grid place-content-center">
      <div className="flex flex-col gap-4 items-center p-5 bg-red-100 text-red-700 rounded-2xl px-4 w-fit">
        <div className="flex flex-col gap-2 items-center">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p>{desc}</p>
          <details className="whitespace-pre-wrap">
            <summary className="cursor-pointer">جزئیات ارور</summary>
            <p>{error.message}</p>
          </details>
        </div>
        <button
          className="bg-white/70 hover:bg-white transition backdrop-blur-2xl text-red-700 font-bold px-2 py-1 rounded-lg"
          onClick={() => reset()}
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}

export default SyntaxError;
