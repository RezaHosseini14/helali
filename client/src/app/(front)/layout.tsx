import MainLayout from "@/layouts/main/MainLayout";
import type { Metadata } from "next";
import "../globals.css";
import "@/assets/css/style.css";
import "@/assets/fonts/keenicons/icon.css";
import "@/assets/fonts/ERPyb/ERPyb.css";
import AudioPlayer from "@/components/global/AudioPlayer";
export const metadata: Metadata = {
  title: "پایگاه‌حفظ‌ونشر‌آثار‌عبدالرضاهلالی",
  description: "پایگاه‌حفظ‌ونشر‌آثار‌عبدالرضاهلالی",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="sp-body">
        <MainLayout>{children}</MainLayout>
        <AudioPlayer />
      </body>
    </html>
  );
}
