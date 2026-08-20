import { Icon } from '@iconify/react';

type DashboardItemPropsType = { icon: string; title: string; count: number; color?: string };

function DashboardItem(props: DashboardItemPropsType) {
  const cardColor = props.color ?? '#0f6e61';
  const formattedCount = new Intl.NumberFormat('fa-IR').format(props.count);

  return (
    <div
      style={{ backgroundColor: `${cardColor}28` }}
      className="section-style relative flex max-h-24 min-h-24 flex-col justify-center overflow-hidden row-span-2"
    >
      <div className="absolute top-0 right-0 rounded-bl-2xl bg-dashboardbackground pb-2 pl-2">
        <div className="dashboard-box relative">
          <Icon
            icon={props.icon}
            style={{
              color: cardColor,
              backgroundColor: `${cardColor}22`,
            }}
            className="section-icon-style text-3xl"
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-1 pr-16 pl-1">
        <span
          style={{ color: cardColor }}
          className="truncate text-sm font-black! tracking-tight sm:text-lg"
        >
          {props.title}
        </span>
        <p
          style={{ color: cardColor }}
          className="truncate text-3xl font-black! leading-none tabular-nums tracking-tight sm:text-4xl"
          title={formattedCount}
        >
          {formattedCount}
        </p>
      </div>
    </div>
  );
}

export default DashboardItem;
