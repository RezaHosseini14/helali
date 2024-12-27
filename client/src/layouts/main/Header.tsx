import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

function Header() {
  return (
    <div className="px-6 mt-4 rounded-xl h-16 bg-white/70 backdrop-blur-lg block shadow-lg">
      <div className="flex items-center justify-between h-full text-mainColor">
        <Link href="/home" className="pinar font-bold text-2xl">
          {/* <Image src="/images/logo.svg" alt="logo" width={90} height={60} /> */}
          عبدالرضا هلالی
        </Link>
      </div>
    </div>
  );
}

export default Header;
