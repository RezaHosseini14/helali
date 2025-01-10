'use client';

import { RootState } from '@/redux/store';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Tooltip, Whisper } from 'rsuite';
import { motion } from 'framer-motion';
// Jsons
import { dashboardMenuItems } from '@/jsons/dashboardMenuItems';

function Sidebar() {
  const [MenueItemActive, setMenueItemActive] = useState<number>(() => {
    return parseInt(localStorage.getItem('activeMenu') || '0');
  });
  const [ActiveChild, setActiveChild] = useState<string | null>(() => {
    return localStorage.getItem('activeChild') || null;
  });

  const { sidebarStatus } = useSelector((state: RootState) => state.style);

  const showChildren = (index: number) => {
    setMenueItemActive(index);
    localStorage.setItem('activeMenu', index.toString());
    localStorage.removeItem('activeChild');
    setActiveChild(null);
  };

  const handleChildClick = (childUrl: string) => {
    setActiveChild(childUrl);
    localStorage.setItem('activeChild', childUrl);
  };

  useEffect(() => {
    const storedActiveMenu = localStorage.getItem('activeMenu');
    if (storedActiveMenu) {
      setMenueItemActive(parseInt(storedActiveMenu));
    }

    const storedActiveChild = localStorage.getItem('activeChild');
    if (storedActiveChild) {
      setActiveChild(storedActiveChild);
    }
  }, []);

  const menuVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <div
      className={`bg-mainstructure ${
        sidebarStatus ? 'w-64' : 'w-16'
      } fixed start-8 top-8 bottom-8 rounded-xl flex gap-1 transition-all duration-500`}
    >
      <div className="py-8 w-16 flex flex-col gap-8 items-center">
        {dashboardMenuItems.map((item, index) => (
          <Whisper
            key={index}
            placement="right"
            controlId="control-id-hover"
            trigger="hover"
            speaker={<Tooltip>{item.title}</Tooltip>}
          >
            <button
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
        className={`py-4 border-s border-gray-600 transition-all duration-200 ease-in-out overflow-hidden ${
          sidebarStatus ? 'opacity-100 visible delay-300 w-48 px-2' : 'opacity-0 invisible !w-0 !p-0 delay-100'
        }`}
      >
        {dashboardMenuItems[MenueItemActive]?.children ? (
          <motion.ul
            key={MenueItemActive}
            className="flex flex-col gap-4"
            initial="hidden"
            animate="visible"
            variants={menuVariants}
          >
            <motion.p className="font-bold px-2 pb-2 border-b border-gray-600 text-xl" variants={childVariants}>
              {dashboardMenuItems[MenueItemActive].title}
            </motion.p>
            {dashboardMenuItems[MenueItemActive].children?.map((child, childIndex) => (
              <motion.li key={childIndex} variants={childVariants}>
                <Link
                  href={child.url}
                  onClick={() => handleChildClick(child.url)}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                    ActiveChild === child.url
                      ? 'bg-maincolor text-white'
                      : 'hover:text-maincolor cursor-pointer hover:bg-maincolor hover:!text-white'
                  }`}
                >
                  <i className={`ki-solid ki-${child.icon} text-xl`}></i>
                  <span className="text-base">{child.title}</span>
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <motion.p
            className="text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            زیرمنویی موجود نیست
          </motion.p>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
