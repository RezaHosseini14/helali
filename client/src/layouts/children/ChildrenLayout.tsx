import { ReactNode } from 'react';

function ChildrenLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="flex flex-col drop-shadow-2xl">
        <div className=" w-full h-40 bg-white/70 backdrop-blur-md">
          <h1 className="potk font-bold text-7xl text-center text-childrencolor">عزیزم حسین (ع)</h1>
        </div>
        <div className="children-header w-full h-36 bg-white/70 backdrop-blur-md mask rotate-180"></div>
      </div>

      <div className="container">
        <div className="bg-childrencolor rounded-3xl shadow-xl shadow-violet-300 h-96 w-full"></div>
      </div>
      {children}
    </div>
  );
}

export default ChildrenLayout;
