import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

function Header() {
  return (
    <div className="px-6 mt-4 rounded-xl h-16 bg-white/70 backdrop-blur-lg block shadow-lg">
      <div className="flex items-center justify-between h-full text-mainColor">
        <Link href="/home">
          <Image src="/images/logo.svg" alt="logo" width={90} height={60} />
        </Link>
        <div className="flex items-center gap-4 text-3xl">
          <Link href="">
            <i className="ki-solid ki-send"></i>
          </Link>
          <Link href="https://www.instagram.com/rezahelaliofficial/?hl=en">
            <i className="ki-solid ki-instagram"></i>
          </Link>
          <Link href="https://x.com/helalireza/status/1383290823404519435?s=19&fbclid=PAZXh0bgNhZW0CMTEAAabou6IZNf9D6ShejSGMsTW3GIPisaKfDF5xADzfjHfF_oEwiOXGH6rwp-k_aem_8XFjTtp3pMH_huVR3Nd4zg">
            <i className="ki-solid ki-twitter"></i>
          </Link>
          <Link href="">
            <i className="ki-solid ki-youtube"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Header;
