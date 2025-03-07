'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button, Tooltip, Whisper } from 'rsuite';

// Services
import { logout } from 'services/auth/authServices';

// Store
import { RootState } from '@/redux/store';
import { TOGGLE_SIDEBAR, TOGGLE_DARK_MODE } from '@/redux/slices/styleSlice';
import { Icon } from '@iconify/react';

function Header() {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state: RootState) => state.style);
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user);

  // ---------------------- State and Ref ----------------------
  const [enable, setEnable] = useState<boolean>(false);

  // ---------------------- Data Fetching ----------------------
  const {} = useQuery({
    queryKey: ['logout'],
    queryFn: logout,
    enabled: enable,
  });

  // ---------------------- Event Handlers ----------------------
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
          <Icon icon={darkMode ? 'solar:sun-bold-duotone' : 'solar:moon-bold-duotone'} fontSize={25} />
        </button>

        <button className="dashboard-header-item" onClick={handleLogout}>
          <Whisper
            placement="bottom"
            controlId="control-id-hover"
            trigger="hover"
            speaker={<Tooltip>خروج</Tooltip>}
          >
            <Icon icon="solar:logout-2-bold-duotone" fontSize={25} />
          </Whisper>
        </button>

        <div className="group relative">
          <button className=" dashboard-header-item">
            <Icon icon="solar:user-bold-duotone" fontSize={25} />
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
                  <Icon icon="solar:logout-2-bold-duotone" fontSize={25} />
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
