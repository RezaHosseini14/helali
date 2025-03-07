'use client';

import Link from 'next/link';
import { PanelPropsType } from './Panel';

function ChildrenPanel(props: PanelPropsType) {
  return (
    <div
      className={`dot-pattern bg-childrencolor/20 border border-childrencolor/45 w-full shadow-xl shadow-violet-200 text-childrencolordarker ${
        props.fill ? `glass-back ${props.container ? '' : 'rounded-[2.5rem]'} p-4` : ''
      } ${props.className ? props.className : ''}`}
    >
      <div className={`flex items-center justify-between ${props.container ? 'container' : ''}`}>
        <h1 className="flex items-center gap-2 text-2xl">
          {props.icon ? <i className={props.icon}></i> : ''}
          <span className="!font-bold">{props.title}</span>
        </h1>
        <div className="flex items-center gap-4">
          {props.moreButton ? (
            <Link
              href={props.moreButton.url}
              className="flex items-center gap-1 bg-gray-400/20 backdrop-blur-sm px-3 py-2 rounded-lg"
            >
              <span className="">{props.moreButton.title ? props.moreButton.title : 'مشاهده همه'}</span>
            </Link>
          ) : (
            ''
          )}
        </div>
      </div>
      <div className={`${props.container ? 'container' : ''}`}>
        <div className={`backdrop-blur-sm w-full h-[2px] rounded-sm mt-2 mb-8`}></div>
      </div>
      {props.children}
    </div>
  );
}

export default ChildrenPanel;
