"use client";

import Image from "next/image";

export default function LandingPage() {
  return (
    <>
      <div className="h-[calc(100vh-5rem)] relative">
        <Image
          className="absolute right-0 bottom-0 -scale-x-100 drop-shadow-xl"
          src="/images/helali.png"
          alt="helali"
          width={800}
          height={40}
        />
        <Image
          className="absolute sm:left-32 sm:top-64 sm:right-auto right-1/2 sm:translate-x-0 translate-x-1/2 top-16"
          src="/images/logo.svg"
          alt="logo"
          width={300}
          height={300}
        />
      </div>
    </>
  );
}
