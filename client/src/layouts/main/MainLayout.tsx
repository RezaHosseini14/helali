import { ReactNode } from "react";
import MainMenu from "@/components/layouts/main/MainMenu";
import Header from "./Header";

function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container pb-20">
      <Header />
      {children}
      <MainMenu />
    </div>
  );
}

export default MainLayout;
