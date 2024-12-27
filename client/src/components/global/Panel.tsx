'use client';
import React, { ReactNode } from 'react';
type PanelPropsType = {
  children: ReactNode;
  title: string;
  fill?: boolean;
  classPrifix?: string;
  className?: string;
  icon?: string;
  container?: boolean;
  dark?: boolean;
};
function Panel(props: PanelPropsType) {
  return (
    <div
      className={`${props.dark ? 'text-white !bg-mainColor' : 'text-mainColor'} shadow-mainshadow ${
        props.fill ? `glass-back ${props.container ? '' : 'rounded-xl'} p-4` : ''
      } ${props.className ? props.className : ''}`}
    >
      <h1 className={`flex items-center gap-2 text-2xl ${props.container ? 'container' : ''}`}>
        {props.icon ? <i className={props.icon}></i> : ''}
        <span className="!font-bold">{props.title}</span>
      </h1>
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
