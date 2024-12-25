'use client';

import { TOGGLE_SIDEBAR, TOGGLE_DARK_MODE } from '@/redux/slices/styleSlice';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { logout } from 'services/auth/authServices';
import { useRouter } from 'next/navigation';
import { Button } from 'rsuite';

function Header() {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state: RootState) => state.style);

  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);
  const [enable, setEnable] = useState<boolean>(false);
  const {} = useQuery({
    queryKey: ['logout'],
    queryFn: logout,
    enabled: enable,
  });

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
      <div className="flex items-center gap-4 text-white">
        <i className="ki-solid ki-burger-menu-5 cursor-pointer text-2xl" onClick={handleToggleSidebar}></i>
        <h1>پایگاه حفظ و نشر آثار عبدالرضاهلالی</h1>
      </div>
      <div className="flex items-center gap-4">
        <button className="dashboard-header-item" onClick={handleToggleDarkMode}>
          {darkMode ? <i className="ki-solid ki-sun"></i> : <i className="ki-solid ki-moon"></i>}
        </button>

        <button className="dashboard-header-item" onClick={handleLogout}>
          <i className="ki-solid ki-exit-left"></i>
        </button>

        <div className="group relative">
          <button className=" dashboard-header-item">
            <i className="ki-solid ki-user"></i>
          </button>

          <div className="!text-black group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-4 opacity-0 invisible absolute left-0 top-12 bg-white/20 backdrop-blur-xl shadow-lg border border-white/20 w-56 h-fit rounded-xl p-4 transition-all z-50">
            <ul className="flex flex-col items-center gap-4 w-full h-full ">
              <li className="rounded-lg w-full text-mianColor">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-start text-sm w-full">
                    <div className="flex items-center justify-between w-full text-white">
                      {user?.last_name + ' ' + user?.first_name}
                    </div>
                  </div>
                </div>
                <div className="h-[1px] w-full bg-white/40 mt-2"></div>
              </li>

              <li className="w-full">
                <Button
                  block
                  appearance="primary"
                  color="red"
                  className="flex items-center justify-between px-3 py-2 w-full h-full"
                  onClick={handleLogout}
                >
                  <span>خروج</span>
                  <i className="ki-solid ki-exit-left"></i>
                </Button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
