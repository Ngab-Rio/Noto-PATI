import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="page-shell narrow-shell">
      <span className="eyebrow">Akses terbatas</span>
      <h1>Halaman ini untuk Admin.</h1>
      <p>Akun Anda tidak memiliki izin untuk membuka area pengelolaan.</p>
      <Link className="button button-primary" href="/">Kembali ke halaman utama</Link>
    </main>
  );
}