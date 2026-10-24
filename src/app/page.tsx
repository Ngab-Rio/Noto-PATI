import Link from "next/link";

import { getCurrentUser } from "@/lib/auth/guards";

export default async function Home() {
  const { user } = await getCurrentUser();

  return (
    <main className="landing-shell">
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
