'use client';

import { TOGGLE_SIDEBAR, TOGGLE_DARK_MODE } from '@/redux/slices/styleSlice';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { logout } from 'services/auth/authServices';
import { useRouter } from 'next/navigation';

function Header() {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state: RootState) => state.style);

  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  const [enable, setEnable] = useState<boolean>(false);
  const {} = useQuery({ queryKey: ['logout'], queryFn: logout, enabled: enable });

  const handleLogout = () => {
    setEnable((prev) => !prev);
    router.push('/');
    toast.success('با موفقیت خارج شدید');
  };

  const handleToggleSidebar = () => {
    dispatch(TOGGLE_SIDEBAR());
  };

  const handleToggleDarkMode = () => {
    dispatch(TOGGLE_DARK_MODE());
  };
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4 text-white text-2xl">
        <i className="ki-solid ki-burger-menu-5 cursor-pointer" onClick={handleToggleSidebar}></i>
        <h1>سامانه</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="dashboard-header-item" onClick={handleToggleDarkMode}>
          {darkMode ? <i className="ki-solid ki-sun"></i> : <i className="ki-solid ki-moon"></i>}
        </button>
        <button className="dashboard-header-item" onClick={handleLogout}>
          <i className="ki-solid ki-exit-left"></i>
        </button>
        <button className="group dashboard-header-item relative">
          <i className="ki-solid ki-user"></i>
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
        </button>
      </div>
    </div>
  );
}

export default Header;
