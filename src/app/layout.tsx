import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { SiteChrome } from "@/components/shared/site-chrome";
import { APP_CONFIG } from "@/config/labels";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${APP_CONFIG.name} — ${APP_CONFIG.tagline}`,
  description:
    "Web pelaporan infrastruktur warga dan transparansi data APBD 2025 Kabupaten Pati.",
  icons: {
    icon: "/images/illustrations/map_pati.svg",
    apple: "/images/illustrations/map_pati.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${poppins.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-text`}
      >
        <SiteChrome>
          <Navbar />
        </SiteChrome>
        <main className="flex-1">{children}</main>
        <SiteChrome>
          <Footer />
        </SiteChrome>
      </body>
    </html>
  );
}
