import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";

import "./globals.css";

const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Noto PATI | Portal Warga",
  description: "Portal warga Kabupaten Pati untuk informasi dan laporan publik.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body className={mono.variable}>{children}</body></html>;
}
