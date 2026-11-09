"use client";

import Link from "@/components/shared/route-link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  List,
  LogOut,
  X,
} from "lucide-react";
import * as React from "react";

const ADMIN_LINKS = [
  {
    href: "/admin",
    label: "Dashboard",
    exact: true,
  },
  {
    href: "/admin/reports",
    label: "Kelola Laporan",
    exact: false,
  },
  {
    href: "/admin/map",
    label: "Peta Laporan",
    exact: false,
  },
];

export function AdminSubnav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/95 shadow-xs backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/admin" className="flex shrink-0 items-center gap-2">
            <Image
              src="/images/logos/noto-pati-logo.svg"
              alt="Noto PATI"
              width={132}
              height={49}
              className="h-10 w-auto"
              priority
            />
            <span className="hidden rounded-md bg-primary-soft px-2 py-1 text-xs font-semibold text-primary sm:inline-flex">
              Admin
            </span>
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
            {ADMIN_LINKS.map((link) => {
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-soft text-primary-dark font-semibold"
                      : "text-text-muted hover:bg-primary-soft/50 hover:text-text"
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <form action="/auth/logout" method="post">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-text-muted hover:bg-primary-soft/50 hover:text-text md:hidden"
          aria-label={mobileMenuOpen ? "Tutup menu admin" : "Buka menu admin"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <List className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-surface px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {ADMIN_LINKS.map((link) => {
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-primary-soft text-primary-dark font-semibold"
                      : "text-text-muted hover:bg-primary-soft/50 hover:text-text"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 flex justify-end border-t border-border pt-3">
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm font-medium text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
