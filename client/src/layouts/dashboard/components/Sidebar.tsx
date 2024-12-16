'use client';

import { dashboardMenuItems } from '@/jsons/dashboardMenuItems';
import { RootState } from '@/redux/store';
import Link from 'next/link';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Tooltip, Whisper } from 'rsuite';

function Sidebar() {
  const [MenueItemActive, setMenueItemActive] = useState<number>(0);
  const { sidebarStatus } = useSelector((state: RootState) => state.style);

  const showChildren = (index: number) => {
    setMenueItemActive(index);
  };

  return (
    <div
      className={`bg-mainstructure ${
        sidebarStatus ? 'w-80' : 'w-24'
      } fixed start-8 top-8 bottom-8 rounded-xl flex gap-1 transition-all duration-500`}
    >
      <div className="py-8 w-24 flex flex-col gap-8 items-center">
        {dashboardMenuItems.map((item, index) => (
          <Whisper
            placement="right"
            controlId="control-id-hover"
            trigger="hover"
            speaker={<Tooltip>{item.title}</Tooltip>}
          >
            <button
              key={index}
              onClick={() => showChildren(index)}
              className={`grid place-content-center size-12 rounded-2xl text-xl ${
                MenueItemActive === index ? 'bg-maincolor text-white' : ''
              }`}
            >
              <i className={`ki-solid ki-${item.icon}`}></i>
            </button>
          </Whisper>
        ))}
      </div>

      {/* Children Menu */}
      <div
        className={`py-4 border-s border-gray-600 transition-all duration-200 ease-in-out ${
          sidebarStatus ? 'opacity-100 visible delay-300 w-56 px-2' : 'opacity-0 invisible !w-0 !p-0 delay-100'
        }`}
      >
        {dashboardMenuItems[MenueItemActive].children ? (
          <ul className="flex flex-col gap-4">
            <p className="font-bold px-2 pb-2 border-b border-gray-600 text-xl">
              {dashboardMenuItems[MenueItemActive].title}
            </p>
            {dashboardMenuItems[MenueItemActive].children?.map((child, childIndex) => (
              <li key={childIndex}>
                <Link
                  href={child.url}
                  className="flex items-center gap-2 p-2 rounded-lg transition-all hover:text-maincolor cursor-pointer hover:bg-maincolor hover:!text-white"
                >
                  <i className={`ki-solid ki-${child.icon} text-xl`}></i>
                  <span className="text-lg">{child.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">زیرمنویی موجود نیست</p>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
