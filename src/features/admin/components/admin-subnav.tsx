"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  MapPin,
  ShieldCheck,
  Coins,
} from "lucide-react";
import { DataSimulationBadge } from "@/components/shared/data-simulation-badge";

const ADMIN_LINKS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/reports",
    label: "Kelola Laporan",
    icon: ClipboardList,
    exact: false,
  },
  {
    href: "/peta",
    label: "Peta Kerusakan",
    icon: MapPin,
    exact: false,
  },
  {
    href: "/anggaran",
    label: "Data APBD",
    icon: Coins,
    exact: false,
  },
];

export function AdminSubnav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-border bg-surface shadow-2xs sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2.5 sm:py-0">
          {/* Left badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary-soft text-primary text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin Pemkab Pati</span>
            </div>
            <span className="text-xs text-text-muted hidden md:inline">
              · Sistem Pengelolaan & Verifikasi
            </span>
          </div>

          {/* Nav Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mx-2 sm:mx-0 px-2 sm:px-0">
            {ADMIN_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-all shrink-0 ${
                    isActive
                      ? "border-primary text-primary font-semibold"
                      : "border-transparent text-text-muted hover:text-text hover:border-border"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right badge */}
          <div className="hidden lg:flex items-center gap-2">
            <DataSimulationBadge />
          </div>
        </div>
      </div>
    </div>
  );
}
