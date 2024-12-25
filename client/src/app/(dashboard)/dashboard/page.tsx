import React from 'react';

function DashboardPage() {
  return (
    <div className="grid grid-cols-12 grid-rows-12 gap-4 h-full">
      <div className="section-style col-span-3 row-span-2 flex items-center gap-4">
        <i className="ki-solid ki-user section-icon-style"></i>
        <span className="font-bold text-xl">تعداد کاربران</span>
      </div>
      <div className="section-style col-span-3 row-span-2 flex items-center gap-4">
        <i className="ki-solid ki-abstract-45 section-icon-style"></i>
        <span className="font-bold text-xl">تعداد صوت‌ها</span>
      </div>
      <div className="section-style col-span-3 row-span-2 flex items-center gap-4">
        <i className="ki-solid ki-abstract-31 section-icon-style"></i>
        <span className="font-bold text-xl">تعداد ویدیو‌ها</span>
      </div>
      <div className="section-style col-span-3 row-span-2 flex items-center gap-4">
        <i className="ki-solid ki-picture section-icon-style"></i>
        <span className="font-bold text-xl">تعداد آلبوم‌ها</span>
      </div>
    </div>
  );
}

export default DashboardPage;
