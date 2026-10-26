"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  FileText,
  Settings,
  ChevronRight,
  LogOut,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROFILE_NAV_ITEMS = [
  {
    href: "/profile",
    label: "Profil Saya",
    icon: User,
    description: "Kelola informasi akun Anda",
  },
  {
    href: "/my-reports",
    label: "Laporan Saya",
    icon: FileText,
    description: "Pantau laporan yang Anda kirim",
  },
  {
    href: "/profile/settings",
    label: "Pengaturan",
    icon: Settings,
    description: "Preferensi akun dan notifikasi",
  },
];

export function ProfileSidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
          <div className="h-12 w-12 rounded-full bg-primary-soft flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text truncate">Akun Warga</h3>
            <p className="text-xs text-text-muted">Panel Pengguna</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {PROFILE_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-text-on-primary shadow-sm"
                    : "text-text-muted hover:bg-primary-soft hover:text-primary-dark"
                )}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <Icon className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-text-on-primary" : "text-text-muted group-hover:text-primary"
                  )} />
                  <span className="truncate">{item.label}</span>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 shrink-0 transition-transform",
                  isActive ? "text-text-on-primary" : "text-text-muted group-hover:text-primary group-hover:translate-x-0.5"
                )} />
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="mt-4 pt-4 border-t border-border">
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </form>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
        <div className="flex items-start gap-2 mb-2">
          <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-text">Keamanan Akun</h4>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Pastikan informasi Anda selalu aman dan terlindungi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
