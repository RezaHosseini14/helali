import React, { ReactNode } from "react";
type PanelPropsType = {
  children: ReactNode;
  title: string;
  fill?: boolean;
  classPrifix?: string;
  icon?: string;
};
function Panel({
  children,
  title,
  fill,
  classPrifix,
  icon,
}: PanelPropsType) {
  return (
    <div
      className={`text-mainColor ${
        fill ? "glass-back rounded-xl p-4" : ""
      }`}
    >
      <h1 className="flex items-center gap-2 text-2xl">
        {icon ? <i className={icon}></i> : ""}
        <span className="!font-bold">{title}</span>
      </h1>
      <div className="bg-white/50 backdrop-blur-sm w-full h-1 rounded-sm mt-2 mb-8"></div>
      {children}
    </div>
  );
}

export default Panel;
