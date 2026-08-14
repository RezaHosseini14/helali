import { Icon } from '@iconify/react';

type DashboardItemPropsType = { icon: string; title: string; count: number; color?: string };

function DashboardItem(props: DashboardItemPropsType) {
  return (
    <div style={{ backgroundColor: `${props.color}60` }} className="section-style row-span-2 max-h-24 relative">
      <div className="bg-dashboardbackground pl-2 pb-2 absolute right-0 top-0 rounded-bl-2xl">
        <div className="dashboard-box relative">
          <Icon
            icon={props.icon}
            style={{ backgroundColor: `${props.color}a1` }}
            className={`section-icon-style text-3xl bg-[${props.color}]`}
          />
        </div>
      </div>
      <div className="pr-16">
        <span className="font-bold text-xl">{props.title}</span>
        <p className="font-bold text-5xl">{props.count}</p>
      </div>
    </div>
  );
}
export default DashboardItem;
