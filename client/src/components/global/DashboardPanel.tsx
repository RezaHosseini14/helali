import React, { ReactNode } from 'react';

function DashboardPanel({ children, title, icon }: { children: ReactNode; title: string; icon?: string }) {
  return (
    <div className="p-4 bg-mainstructure rounded-xl shadow relative">
      <h2 className="text-xl font-bold mb-4 border-b border-gray-600 pb-2">
        <i className={`ki-outline ${icon}`}></i>
        {title}
      </h2>
      {children}
    </div>
  );
}

export default DashboardPanel;
