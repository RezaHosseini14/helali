import type { Metadata } from "next";
import "./globals.css";
import "@/assets/css/style.css";
import "@/assets/fonts/keenicons/icon.css";
import "@/assets/fonts/ERPyb/ERPyb.css";

import "rsuite/dist/rsuite-no-reset.min.css";
import RsuiteProvider from "providers/RsuiteProvider";

export const metadata: Metadata = {
  title: "پایگاه‌حفظ‌ونشر‌آثار‌عبدالرضاهلالی",
  description: "پایگاه‌حفظ‌ونشر‌آثار‌عبدالرضاهلالی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <RsuiteProvider>{children}</RsuiteProvider>
      </body>
    </html>
  );
}
