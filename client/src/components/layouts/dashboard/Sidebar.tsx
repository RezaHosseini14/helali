'use client';
import {
  dashboardMenuItems,
  dashboardMenuItemsType,
} from '@/jsons/dashboardMenuItems';
import Link from 'next/link';
import React, { useState } from 'react';

function Sidebar() {
  const [openItems, setOpenItems] = useState<Record<number, boolean>>(
    {},
  );

  const toggleItem = (index: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="bg-mainColor rounded-xl w-[18rem] h-full p-4 shadow-md">
      <div className="flex flex-col gap-4">
        {dashboardMenuItems.map(
          (item: dashboardMenuItemsType, index) => (
            <div key={index} className="transition">
              <div
                className="flex items-center justify-between gap-2 text-xl font-medium cursor-pointer text-gray-800 bg-white/70 rounded-md p-2 hover:bg-white/90"
                onClick={() => toggleItem(index)}
              >
                <div className="flex items-center gap-2">
                  <i className={`ki-outline ${item.icon}`}></i>
                  <span>{item.title}</span>
                </div>
                {item?.children && (
                  <span
                    className={`text-sm text-gray-600 transform transition-transform duration-300 ${
                      openItems[index] ? 'rotate-180' : 'rotate-0'
                    }`}
                  >
                    <i className="ki-outline ki-down"></i>
                  </span>
                )}
              </div>

              {item?.children && (
                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    openItems[index] ? 'max-h-screen' : 'max-h-0'
                  }`}
                >
                  <div className="mr-4 mt-2 space-y-2">
                    {item.children.map((child, childIndex) => (
                      <Link
                        key={childIndex}
                        href={child.url || '#'}
                        className="flex items-center gap-2 text-base text-gray-600 hover:text-gray-800 bg-white/70 rounded-md p-2 hover:bg-white/90"
                      >
                        <i className={`ki-outline ${child.icon}`}></i>
                        <span>{child.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ),
        )}
      </div>
    </div>
  );
}

export default Sidebar;
