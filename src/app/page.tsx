import Link from "next/link";

import { logout } from "@/app/auth/actions";
import { getCurrentRole, getCurrentUser } from "@/lib/auth/guards";

export default async function Home() {
  const { user } = await getCurrentUser();
  const role = user ? await getCurrentRole(user.id) : null;

  return (
    <main className="landing-shell">
      <nav className="site-nav">
        <Link className="brand" href="/">Noto <span>PATI</span></Link>
        <div className="nav-links">
          <Link href="/">Laporan publik</Link>
          {user ? <Link href="/profile">Profil</Link> : <Link href="/login">Masuk</Link>}
          {role === "admin" && <Link href="/admin">Admin</Link>}
          {user && <form action={logout}><button className="text-button" type="submit">Keluar</button></form>}
        </div>
      </nav>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Portal warga Kabupaten Pati</span>
          <h1>Perhatian kecil, perubahan yang terasa.</h1>
          <p>Noto PATI membantu warga menyampaikan kebutuhan fasilitas publik dengan jelas, aman, dan dapat ditindaklanjuti.</p>
          <div className="hero-actions">
            {user ? <Link className="button button-primary" href="/profile">Buka profil</Link> : <Link className="button button-primary" href="/register">Mulai sebagai warga</Link>}
            <Link className="button button-secondary" href="/login">Masuk ke akun</Link>
          </div>
        </div>
        <div className="hero-mark" aria-hidden="true"><span>01</span><strong>Noto<br />PATI</strong></div>
      </section>
      <section className="public-strip">
        <div><span className="eyebrow">Terbuka untuk semua</span><h2>Informasi publik tetap bisa diakses tanpa login.</h2></div>
        <p>Login dibutuhkan saat Anda ingin membuat laporan atau mengelola data pribadi.</p>
      </section>
    </main>
  );
}
