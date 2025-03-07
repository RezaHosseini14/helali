import Link from 'next/link';

function Header() {
  return (
    <div className="container z-50">
      <div className="px-6 mt-4 rounded-xl h-16 bg-white/70 backdrop-blur-lg block shadow-mainshadow">
        <div className="flex items-center justify-between h-full text-mainColor">
          <ul className="flex items-center header-items">
            <li className="flex-1">
              <Link className="text-lg font-medium w-full px-4" href="">
                صوت
              </Link>
            </li>
            <li className="flex-1">
              <Link className="text-lg font-medium w-full px-4" href="">
                ویدیو
              </Link>
            </li>
          </ul>
          <Link href="/" className="potk font-bold text-2xl">
            {/* <Image src="/images/logo.svg" alt="logo" width={90} height={60} /> */}
            عبدالرضا هلالی
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Header;
