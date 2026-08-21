import { Icon } from '@iconify/react';

type DashboardItemPropsType = { icon: string; title: string; count: number; color?: string };

function DashboardItem(props: DashboardItemPropsType) {
  const cardColor = props.color ?? '#0f6e61';
  const formattedCount = new Intl.NumberFormat('fa-IR').format(props.count);

  return (
    <div
      style={{ backgroundColor: `${cardColor}28` }}
      className="section-style relative flex min-h-20 max-h-20 flex-col justify-center overflow-hidden sm:min-h-24 sm:max-h-24"
    >
      <div className="absolute top-0 right-0 rounded-bl-2xl bg-dashboardbackground pb-1.5 pl-1.5 sm:pb-2 sm:pl-2">
        <div className="dashboard-box relative">
          <Icon
            icon={props.icon}
            style={{
              color: cardColor,
              backgroundColor: `${cardColor}22`,
            }}
            className="section-icon-style size-11 text-2xl sm:size-14 sm:text-3xl"
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-0.5 pr-14 pl-1 sm:gap-1 sm:pr-16">
        <span
          style={{ color: cardColor }}
          className="truncate text-xs font-black! tracking-tight sm:text-sm md:text-lg"
        >
          {props.title}
        </span>
        <p
          style={{ color: cardColor }}
          className="truncate text-2xl font-black! leading-none tabular-nums tracking-tight sm:text-3xl md:text-4xl"
          title={formattedCount}
        >
          {formattedCount}
        </p>
      </div>
    </div>
  );
}

export default DashboardItem;
