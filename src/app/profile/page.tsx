import { logout } from "@/app/auth/actions";
import { ProfileForm } from "@/app/profile/ProfileForm";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="page-shell narrow-shell">
      <div className="page-heading">
        <span className="eyebrow">Akun warga</span>
        <h1>Profil Anda</h1>
        <p>Kelola informasi dasar yang digunakan saat Anda berinteraksi dengan Noto PATI.</p>
      </div>
      <section className="surface profile-surface">
        <p className="field-caption">Email terverifikasi</p>
        <p className="email-value">{user.email}</p>
        <ProfileForm fullName={profile?.full_name ?? ""} phone={profile?.phone ?? ""} />
      </section>
      <form action={logout}>
        <button className="button button-secondary" type="submit">Keluar</button>
      </form>
    </main>
  );
}