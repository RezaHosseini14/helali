import { ReactNode } from 'react';
import { Button } from 'rsuite';

type buttonsType = {
  icon: string;
  title: string;
  onClick: () => void;
};

type DashboardPanelPropsType = {
  children: ReactNode;
  title: string;
  icon?: string;
  buttons?: buttonsType[];
};

function DashboardPanel(props: DashboardPanelPropsType) {
  return (
    <div className="p-4 bg-mainstructure rounded-xl shadow relative">
      <div className="flex items-center justify-center w-full pb-2 border-b mb-4 border-gray-600">
        <h2 className="text-xl font-bold flex-1">
          <i className={`ki-outline ${props.icon}`}></i>
          {props.title}
        </h2>
        <div>
          {props.buttons?.map((button) => (
            <Button appearance="primary" onClick={button.onClick} size="sm" className="flex items-center gap-1">
              <i className={button.icon + ' text-lg'}></i>
              <span className="leading-6">{button.title}</span>
            </Button>
          ))}
        </div>
      </div>
      {props.children}
    </div>
  );
}

export default DashboardPanel;
