"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, PlusCircle, BarChart3, Menu, X, Landmark, User, LogOut } from "lucide-react";
import { APP_CONFIG } from "@/config/labels";
import { cn } from "@/lib/utils";
import type { AppRole } from "@/lib/auth/guards";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/reports", label: "Laporan", icon: PlusCircle },
  { href: "/map", label: "Peta Laporan", icon: MapPin },
  { href: "/budget", label: "Anggaran APBD", icon: BarChart3 },
];

interface NavbarClientProps {
  user: { id: string; email?: string } | null;
  role: AppRole | null;
}

/**
 * NavbarClient - Client Component
 * Menerima data user & role dari parent Server Component
 * Handles interaktivitas: mobile menu, active states
 */
export function NavbarClient({ user, role }: NavbarClientProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Tutup mobile menu saat pindah rute
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-text-on-primary shadow-xs group-hover:bg-primary-dark transition-colors">
              <Landmark className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-text">
                {APP_CONFIG.name}
              </span>
              <span className="text-[11px] text-text-muted font-medium -mt-0.5">
                {APP_CONFIG.region}
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-soft text-primary-dark font-semibold"
                    : "text-text-muted hover:bg-primary-soft/50 hover:text-text"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions (Authenticated vs Guest) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {/* Authenticated User Actions */}
              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text px-3 py-2 rounded-lg hover:bg-primary-soft/40 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Profil</span>
              </Link>

              {role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-text px-3 py-2 rounded-lg hover:bg-primary-soft/40 transition-colors"
                >
                  <span>Dashboard Admin</span>
                </Link>
              )}

              <Link
                href="/report/new"
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-text-on-primary text-sm font-medium px-4 py-2 rounded-lg shadow-xs transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Lapor Masalah</span>
              </Link>

              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 text-sm font-medium text-text-muted hover:text-red-600 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  title="Keluar dari akun"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Keluar</span>
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Guest User Actions */}
              <Link
                href="/login"
                className="text-sm font-medium text-text-muted hover:text-text px-3 py-2 rounded-lg hover:bg-primary-soft/40 transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/report/new"
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-text-on-primary text-sm font-medium px-4 py-2 rounded-lg shadow-xs transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Lapor Masalah</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/report/new"
            className="flex items-center gap-1 bg-primary text-text-on-primary text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xs"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Lapor</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-primary-soft/50 focus:outline-none"
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface px-4 pt-2 pb-4 space-y-2">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium",
                  isActive
                    ? "bg-primary-soft text-primary-dark font-semibold"
                    : "text-text-muted hover:bg-primary-soft/40 hover:text-text"
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-border mt-2 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-lg border border-border bg-surface text-text hover:bg-primary-soft/50 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Profil Saya</span>
                </Link>
                {role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium py-2 px-3 rounded-lg border border-border bg-surface text-text hover:bg-primary-soft/50 transition-colors"
                  >
                    Dashboard Admin
                  </Link>
                )}
                <form action="/auth/logout" method="post">
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Keluar</span>
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="text-center text-sm font-medium py-2 rounded-lg border border-border bg-surface text-text hover:bg-primary-soft/50 transition-colors"
              >
                Masuk ke Akun
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
