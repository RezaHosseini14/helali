"use client";
import { CustomProvider } from "rsuite";
function RsuiteProvider({
  children,
}: Readonly<{
  children: any;
}>) {
  return <CustomProvider>{children}</CustomProvider>;
}

export default RsuiteProvider;
