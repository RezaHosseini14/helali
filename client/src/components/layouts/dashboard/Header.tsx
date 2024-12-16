'use client';

import { RootState } from '@/redux/store';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
//services
import { logout } from 'services/auth/authServices';

function Header() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  const [enable, setEnable] = useState<boolean>(false);
  const {} = useQuery({ queryKey: ['logout'], queryFn: logout, enabled: enable });

  const handleLogout = () => {
    setEnable((prev) => !prev);
    router.push('/');
    toast.success('با موفقیت خارج شدید');
  };

  return (
    <div className="bg-mainColor h-16 rounded-xl flex items-center justify-between p-4 text-white">
      <span className="h4 text-lg">پنل مدیریتی</span>
      <div className="flex items-center gap-4 text-xl">
        <div className="group text-white text-lg relative">
          <div className='flex items-center gap-2 bg-white rounded-xl text-mainColor px-2 py-2'>
            <p className='leading-3 -mb-1'>{user?.username}</p>
            <i className="ki-outline ki-user text-xl cursor-pointer"></i>
          </div>

          <div className="!text-black group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-4 opacity-0 invisible absolute left-0 top-14 bg-white/20 backdrop-blur-xl shadow-lg border border-mianColor/30 w-56 h-fit rounded-xl p-4 transition-all z-50">
            <ul className="flex flex-col items-center gap-4 w-full h-full ">
              <li className="rounded-lg w-full text-mianColor">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-start text-sm w-full">
                    <div className="flex items-center justify-between w-full">
                      <span>{user.first_name}</span>
                    </div>
                    <span>{user?.last_name}</span>
                  </div>
                </div>
                <div className="h-[1px] w-full bg-gray-200 mt-2"></div>
              </li>

              <li className="rounded-lg bg-red-300/30 hover:bg-red-500 hover:text-white transition w-full text-red-500">
                <button className="flex items-center justify-between px-3 py-2 w-full h-full" onClick={handleLogout}>
                  <span>خروج</span>
                  <span className="iconlyBulk-Logout text-lg">
                    <span className="path1"></span>
                    <span className="path2"></span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
