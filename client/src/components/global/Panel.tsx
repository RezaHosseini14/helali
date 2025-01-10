'use client';
import Link from 'next/link';
import React, { ReactNode } from 'react';
import { Button } from 'rsuite';

type MoreButtonType = {
  url: string;
  title?: '';
};

type PanelPropsType = {
  children: ReactNode;
  title: string;
  fill?: boolean;
  classPrifix?: string;
  className?: string;
  icon?: string;
  container?: boolean;
  dark?: boolean;
  moreButton?: MoreButtonType;
};
function Panel(props: PanelPropsType) {
  return (
    <div
      className={`${props.dark ? 'text-white !bg-mainColor' : 'text-mainColor'} shadow-mainshadow ${
        props.fill ? `glass-back ${props.container ? '' : 'rounded-xl'} p-4` : ''
      } ${props.className ? props.className : ''}`}
    >
      <div className={`flex items-center justify-between ${props.container ? 'container' : ''}`}>
        <h1 className="flex items-center gap-2 text-2xl">
          {props.icon ? <i className={props.icon}></i> : ''}
          <span className="!font-bold">{props.title}</span>
        </h1>
        <div className="flex items-center gap-4">
          {props.moreButton ? (
            <Link href={props.moreButton.url} className="flex items-center gap-1 bg-gray-400/20 backdrop-blur-sm px-3 py-2 rounded-lg">
              <span className="">{props.moreButton.title ? props.moreButton.title : 'مشاهده همه'}</span>
            </Link>
          ) : (
            ''
          )}
        </div>
      </div>
      <div className={`${props.container ? 'container' : ''}`}>
        <div
          className={`${
            props.dark ? 'bg-white/50' : 'bg-mainColor/50'
          } backdrop-blur-sm w-full h-[2px] rounded-sm mt-2 mb-8 `}
        ></div>
      </div>
      {props.children}
    </div>
  );
}

export default Panel;
