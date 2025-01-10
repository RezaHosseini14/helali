'use client';

import { menuItems, MenuItemsType } from '@/jsons/menuItems';
import Link from 'next/link';
import { MouseEvent } from 'react';

function MainMenu() {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const parent: any = document.querySelector('#parent');
    const border: any = document.querySelector('#border');
    const element = e.currentTarget;

    const parentRect = parent.getBoundingClientRect();
    const borderRect = element.getBoundingClientRect();

    border.style.right = `${parentRect.right - borderRect.right}px`;
  };

  return (
    <div
      id="parent"
      className="tab-menue px-6 rounded-xl w-72 h-12 bg-white/70 z-50 !fixed bottom-4 right-1/2 translate-x-1/2 backdrop-blur-lg shadow-md"
    >
      <ul className="flex items-center justify-around h-full text-2xl text-mainColor relative">
        {menuItems.map((item: MenuItemsType, index: number) => (
          <li key={index}>
            <Link href={item.url} onClick={(e: any) => handleClick(e)}>
              <i className={`ki-solid ${item.icon}`}></i>
            </Link>
          </li>
        ))}
      </ul>
      <div
        id="border"
        className="h-1 w-6 bg-mainColor bottom-1 absolute transition-all rounded-lg right-[2.6rem]"
      ></div>
    </div>
  );
}

export default MainMenu;
