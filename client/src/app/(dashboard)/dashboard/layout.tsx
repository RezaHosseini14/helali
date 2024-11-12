import DashboardLayout from "@/layouts/dashboard/DashboardLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "as",
  description: "as",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <DashboardLayout>{children}</DashboardLayout>
      </body>
    </html>
  );
}
