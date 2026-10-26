import { logout } from "@/app/auth/actions";
import { ProfileForm } from "./ProfileForm";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { User, Mail, Phone } from "lucide-react";

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-semibold mb-3">
          <User className="h-3.5 w-3.5" />
          <span>Profil Akun</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text">
          Informasi Profil
        </h1>
        <p className="text-sm text-text-muted mt-1.5 leading-relaxed">
          Kelola informasi dasar yang digunakan saat Anda berinteraksi dengan Noto PATI
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-xs">
        {/* Email Display (Read-only) */}
        <div className="mb-6 pb-6 border-b border-border">
          <label className="flex items-center gap-2 text-sm font-medium text-text mb-2">
            <Mail className="h-4 w-4 text-text-muted" />
            <span>Email Terverifikasi</span>
          </label>
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-background border border-border">
            <span className="text-sm text-text font-medium">{user.email}</span>
            <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 text-xs font-medium">
              ✓ Terverifikasi
            </span>
          </div>
          <p className="text-xs text-text-muted mt-2">
            Email digunakan untuk login dan notifikasi penting
          </p>
        </div>

        {/* Editable Profile Form */}
        <ProfileForm fullName={profile?.full_name ?? ""} phone={profile?.phone ?? ""} />
      </div>
    </div>
  );
}