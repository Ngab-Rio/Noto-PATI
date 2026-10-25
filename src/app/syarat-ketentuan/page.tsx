import type { Metadata } from "next";
import { IconFileText, IconAlertTriangle, IconCheckCircle } from "@/components/shared/icons";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan · Noto PATI",
  description:
    "Syarat dan ketentuan penggunaan platform Noto PATI untuk pelaporan infrastruktur publik.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-border pb-6 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-semibold mb-3">
            <IconFileText className="h-3.5 w-3.5" />
            <span>Aturan Penggunaan</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text mb-3">
            Syarat & Ketentuan Penggunaan
          </h1>
          <p className="text-sm text-text-muted">
            Terakhir diperbarui: 20 Januari 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-sm sm:prose max-w-none space-y-8">
          {/* Pendahuluan */}
          <section>
            <h2 className="text-xl font-bold text-text mb-3">
              1. Penerimaan Ketentuan
            </h2>
            <p className="text-text-muted leading-relaxed">
              Dengan mengakses dan menggunakan platform Noto PATI, Anda menyetujui untuk terikat dengan 
              syarat dan ketentuan berikut. Jika Anda tidak setuju, mohon tidak menggunakan layanan kami.
            </p>
            <div className="mt-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                <strong>Catatan Prototipe:</strong> Noto PATI adalah platform demonstrasi konsep. 
                Laporan yang dibuat tidak terhubung dengan sistem pemerintahan resmi dan digunakan untuk 
                simulasi transparansi partisipasi warga.
              </p>
            </div>
          </section>

          {/* Layanan */}
          <section>
            <h2 className="text-xl font-bold text-text mb-3">
              2. Deskripsi Layanan
            </h2>
            <p className="text-text-muted mb-3">
              Noto PATI adalah platform digital yang memfasilitasi warga untuk:
            </p>
            <ul className="list-disc pl-6 text-text-muted space-y-2">
              <li>Melaporkan kerusakan infrastruktur publik (jalan, lampu, drainase, dll.)</li>
              <li>Melampirkan foto dan lokasi GPS untuk dokumentasi</li>
              <li>Memantau status tindak lanjut laporan secara transparan</li>
              <li>Melihat peta sebaran laporan dari warga lain</li>
              <li>Mengakses informasi transparansi anggaran APBD untuk infrastruktur</li>
            </ul>
            <p className="text-sm text-text-muted mt-3 italic">
              Layanan ini bersifat <strong>gratis tanpa biaya administrasi</strong> untuk pengguna.
            </p>
          </section>

          {/* Akun Pengguna */}
          <section>
            <h2 className="text-xl font-bold text-text mb-3">
              3. Akun dan Tanggung Jawab Pengguna
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-text mb-2 flex items-center gap-2">
                  <IconCheckCircle className="h-4 w-4 text-emerald-600" />
                  Kewajiban Pengguna:
                </h3>
                <ul className="list-disc pl-6 text-text-muted space-y-1">
                  <li>Memberikan informasi yang <strong>akurat dan jujur</strong> saat mendaftar</li>
                  <li>Menjaga kerahasiaan password akun Anda</li>
                  <li>Tidak membagikan akun kepada orang lain</li>
                  <li>Segera melaporkan jika akun Anda diretas atau disalahgunakan</li>
                  <li>Berusia minimal <strong>17 tahun</strong> atau memiliki izin wali untuk pengguna di bawah 17 tahun</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-text mb-2 flex items-center gap-2">
                  <IconAlertTriangle className="h-4 w-4 text-amber-600" />
                  Larangan Penggunaan:
                </h3>
                <ul className="list-disc pl-6 text-text-muted space-y-1">
                  <li>Membuat laporan <strong>palsu, menyesatkan, atau hoaks</strong></li>
                  <li>Mengunggah foto yang mengandung SARA, pornografi, atau kekerasan</li>
                  <li>Menggunakan platform untuk spam, phishing, atau aktivitas ilegal</li>
                  <li>Mengakses atau merusak sistem keamanan platform</li>
                  <li>Menyebarkan malware, virus, atau kode berbahaya</li>
                  <li>Menyamar sebagai pengguna lain atau pejabat pemerintah</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Konten Pengguna */}
          <section>
            <h2 className="text-xl font-bold text-text mb-3">
              4. Konten yang Anda Unggah
            </h2>
            <div className="space-y-3">
              <p className="text-text-muted">
                Setiap laporan yang Anda buat (foto, deskripsi, lokasi) akan <strong>dipublikasikan tanpa identitas pribadi Anda</strong> (anonim).
              </p>
              <div className="p-4 rounded-lg bg-surface border border-border">
                <p className="text-sm text-text-muted mb-2">
                  <strong className="text-text">Anda bertanggung jawab penuh</strong> atas konten yang diunggah:
                </p>
                <ul className="list-disc pl-6 text-text-muted space-y-1 text-sm">
                  <li>Pastikan foto tidak mengandung wajah, plat nomor, atau informasi pribadi orang lain</li>
                  <li>Pastikan deskripsi objektif dan tidak mengandung fitnah atau pencemaran nama baik</li>
                  <li>Pastikan lokasi GPS akurat dan sesuai dengan kerusakan yang dilaporkan</li>
                </ul>
              </div>
              <p className="text-sm text-text-muted italic">
                Dengan mengunggah konten, Anda memberikan Noto PATI lisensi non-eksklusif untuk menampilkan, 
                menyimpan, dan mendistribusikan konten tersebut dalam konteks layanan platform.
              </p>
            </div>
          </section>

          {/* Moderasi */}
          <section>
            <h2 className="text-xl font-bold text-text mb-3">
              5. Moderasi dan Penghapusan Konten
            </h2>
            <p className="text-text-muted mb-3">
              Kami berhak untuk:
            </p>
            <ul className="list-disc pl-6 text-text-muted space-y-2">
              <li><strong>Meninjau laporan</strong> sebelum dipublikasikan untuk memastikan kepatuhan terhadap ketentuan ini</li>
              <li><strong>Menghapus atau menolak</strong> laporan yang melanggar ketentuan tanpa pemberitahuan sebelumnya</li>
              <li><strong>Menonaktifkan akun</strong> pengguna yang berulang kali melanggar ketentuan</li>
              <li><strong>Melaporkan aktivitas ilegal</strong> kepada pihak berwenang jika diperlukan</li>
            </ul>
          </section>

          {/* Batasan Tanggung Jawab */}
          <section>
            <h2 className="text-xl font-bold text-text mb-3">
              6. Batasan Tanggung Jawab Platform
            </h2>
            <div className="p-5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-text-muted mb-3">
                <strong className="text-amber-900 dark:text-amber-200">Noto PATI adalah platform pelaporan, bukan penyedia layanan perbaikan infrastruktur.</strong>
              </p>
              <ul className="list-disc pl-6 text-text-muted space-y-2 text-sm">
                <li>Kami <strong>tidak menjamin</strong> laporan Anda akan ditindaklanjuti oleh pemerintah daerah</li>
                <li>Kami <strong>tidak bertanggung jawab</strong> atas kecepatan atau kualitas perbaikan infrastruktur</li>
                <li>Kami <strong>tidak memverifikasi secara langsung</strong> setiap laporan di lapangan (verifikasi dilakukan oleh dinas terkait dalam prototipe)</li>
                <li>Kami <strong>tidak bertanggung jawab</strong> atas gangguan layanan, kehilangan data, atau kerusakan yang timbul dari penggunaan platform</li>
              </ul>
            </div>
            <p className="text-sm text-text-muted mt-3">
              Platform disediakan <strong>&quot;apa adanya&quot; (as is)</strong> tanpa jaminan tersurat atau tersirat.
            </p>
          </section>

          {/* Hak Kekayaan Intelektual */}
          <section>
            <h2 className="text-xl font-bold text-text mb-3">
              7. Hak Kekayaan Intelektual
            </h2>
            <p className="text-text-muted">
              Semua hak cipta, merek dagang, logo, dan desain platform Noto PATI adalah milik pengembang platform. 
              Anda tidak diperkenankan untuk menyalin, memodifikasi, atau mendistribusikan elemen desain platform 
              tanpa izin tertulis.
            </p>
          </section>

          {/* Perubahan Layanan */}
          <section>
            <h2 className="text-xl font-bold text-text mb-3">
              8. Perubahan dan Penghentian Layanan
            </h2>
            <p className="text-text-muted">
              Kami berhak untuk:
            </p>
            <ul className="list-disc pl-6 text-text-muted space-y-1">
              <li>Mengubah, menangguhkan, atau menghentikan layanan kapan saja dengan atau tanpa pemberitahuan</li>
              <li>Memperbarui syarat dan ketentuan ini. Perubahan signifikan akan diberitahukan melalui email</li>
            </ul>
            <p className="text-sm text-text-muted mt-3">
              Penggunaan platform setelah perubahan ketentuan berarti Anda menyetujui perubahan tersebut.
            </p>
          </section>

          {/* Hukum yang Berlaku */}
          <section>
            <h2 className="text-xl font-bold text-text mb-3">
              9. Hukum yang Berlaku
            </h2>
            <p className="text-text-muted">
              Syarat dan ketentuan ini diatur berdasarkan hukum Republik Indonesia. Setiap sengketa yang timbul 
              akan diselesaikan melalui musyawarah atau jalur hukum di Pengadilan Negeri Kabupaten Pati.
            </p>
          </section>

          {/* Kontak */}
          <section className="border-t border-border pt-6">
            <h2 className="text-xl font-bold text-text mb-3">
              Hubungi Kami
            </h2>
            <p className="text-text-muted mb-3">
              Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini:
            </p>
            <div className="p-4 rounded-lg bg-surface border border-border">
              <p className="text-sm text-text-muted">
                <strong className="text-text">Email:</strong>{" "}
                <a href="mailto:support@notopati.id" className="text-primary hover:underline">
                  support@notopati.id
                </a>
              </p>
              <p className="text-sm text-text-muted mt-1">
                <strong className="text-text">Alamat:</strong> (Placeholder - Untuk prototipe demonstrasi)
              </p>
            </div>
          </section>

          {/* Footer Note */}
          <div className="mt-8 p-5 rounded-xl bg-primary-soft border border-primary/25">
            <p className="text-xs text-text-muted italic">
              <strong>Catatan:</strong> Syarat dan ketentuan ini disusun untuk prototipe platform Noto PATI. 
              Implementasi produksi memerlukan konsultasi hukum dan penyesuaian dengan peraturan daerah setempat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
