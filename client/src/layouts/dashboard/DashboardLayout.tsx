import React, { ReactNode } from "react";
import Header from "@/components/layouts/dashboard/Header";
import Sidebar from "@/components/layouts/dashboard/Sidebar";

function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-8">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
