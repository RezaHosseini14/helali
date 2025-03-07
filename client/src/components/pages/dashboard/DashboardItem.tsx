import { Icon } from '@iconify/react';

type DashboardItemPropsType = { icon: string; title: string; count: number };

function DashboardItem({ icon, title, count }: DashboardItemPropsType) {
  return (
    <div className="section-style row-span-2 flex items-center gap-4">
      <Icon icon={icon} className="section-icon-style text-3xl" />
      <div>
        <span className="font-bold text-xl">{title}</span>
        <p className="font-bold text-5xl">{count}</p>
      </div>
    </div>
  );
}
export default DashboardItem;
