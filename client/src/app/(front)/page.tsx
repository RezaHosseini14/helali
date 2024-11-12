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
          className="absolute left-32 top-64"
          src="/images/logo.svg"
          alt="logo"
          width={300}
          height={300}
        />
      </div>
    </>
  );
}
