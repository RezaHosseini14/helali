import Image from "next/image";
import React from "react";

function Header() {
  return (
    <div className="px-6 mt-4 rounded-xl h-16 bg-white/70 backdrop-blur-lg block shadow-lg">
      <div className="flex items-center justify-between h-full text-mainColor">
        <Image
          src="/images/logo.svg"
          alt="logo"
          width={90}
          height={60}
        />

        <div className="flex items-center gap-4 text-3xl">
          <a href="">
            <i className="ki-solid ki-send"></i>
          </a>
          <a href="">
            <i className="ki-solid ki-instagram"></i>
          </a>
          <a href="">
            <i className="ki-solid ki-twitter"></i>
          </a>
          <a href="">
            <i className="ki-solid ki-youtube"></i>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Header;
