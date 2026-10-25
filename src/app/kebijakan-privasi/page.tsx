import type { Metadata } from "next";
import { IconShield, IconLock, IconEye } from "@/components/shared/icons";

export const metadata: Metadata = {
  title: "Kebijakan Privasi · Noto PATI",
  description:
    "Kebijakan privasi dan perlindungan data pribadi pengguna platform Noto PATI sesuai UU PDP 27/2022.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-border pb-6 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary-dark text-xs font-semibold mb-3">
            <IconShield className="h-3.5 w-3.5" />
            <span>Perlindungan Data Pribadi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text mb-3">
            Kebijakan Privasi
          </h1>
          <p className="text-sm text-text-muted">
            Terakhir diperbarui: 20 Januari 2025
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-sm sm:prose max-w-none space-y-8">
          {/* Pendahuluan */}
          <section>
            <h2 className="text-xl font-bold text-text mb-3 flex items-center gap-2">
              <IconLock className="h-5 w-5 text-primary" />
              Pendahuluan
            </h2>
            <p className="text-text-muted leading-relaxed">
              Noto PATI berkomitmen melindungi privasi dan data pribadi pengguna sesuai dengan 
              Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP). 
              Kebijakan ini menjelaskan data apa saja yang kami kumpulkan, bagaimana kami menggunakannya, 
              dan hak-hak Anda sebagai pengguna.
            </p>
            <div className="mt-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
                <strong>Catatan Prototipe:</strong> Noto PATI adalah platform demonstrasi konsep. 
                Data yang Anda masukkan digunakan untuk simulasi dan tidak terhubung dengan sistem 
                pemerintahan resmi.
              </p>
            </div>
          </section>

          {/* Data yang Dikumpulkan */}
          <section>
            <h2 className="text-xl font-bold text-text mb-3">
              1. Data Pribadi yang Kami Kumpulkan
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-text mb-2">a. Data Akun (Bersifat Privat)</h3>
                <ul className="list-disc pl-6 text-text-muted space-y-1">
                  <li>Nama lengkap</li>
                  <li>Alamat email</li>
                  <li>Nomor telepon (opsional)</li>
                  <li>Password (terenkripsi)</li>
                </ul>
                <p className="text-sm text-text-muted mt-2 italic">
                  Data ini <strong>tidak ditampilkan ke publik</strong> dan hanya digunakan untuk autentikasi.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-text mb-2">b. Data Laporan (Bersifat Publik)</h3>
                <ul className="list-disc pl-6 text-text-muted space-y-1">
                  <li>Foto kerusakan infrastruktur</li>
                  <li>Koordinat GPS lokasi kerusakan</li>
                  <li>Deskripsi masalah</li>
                  <li>Kategori kerusakan (jalan, lampu, drainase, dll.)</li>
                  <li>Waktu pelaporan</li>
                </ul>
                <p className="text-sm text-text-muted mt-2 italic">
                  Laporan yang Anda buat akan <strong>ditampilkan secara publik tanpa identitas pribadi Anda</strong> (anonim).
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-text mb-2">c. Data Teknis</h3>
                <ul className="list-disc pl-6 text-text-muted space-y-1">
                  <li>Alamat IP</li>
                  <li>Browser dan perangkat yang digunakan</li>
                  <li>Waktu akses platform</li>
                </ul>
                <p className="text-sm text-text-muted mt-2 italic">
                  Data ini digunakan untuk keamanan sistem dan analitik performa.
                </p>
              </div>
            </div>
          </section>

          {/* Penggunaan Data */}
          <section>
            <h2 className="text-xl font-bold text-text mb-3">
              2. Bagaimana Kami Menggunakan Data Anda
            </h2>
            <ul className="list-disc pl-6 text-text-muted space-y-2">
              <li><strong>Menyediakan layanan platform:</strong> Mengelola akun, menyimpan laporan, dan menampilkan peta infrastruktur.</li>
              <li><strong>Komunikasi:</strong> Mengirim notifikasi status laporan dan pembaruan penting (via email).</li>
              <li><strong>Keamanan:</strong> Mencegah penyalahgunaan, spam, dan aktivitas mencurigakan.</li>
              <li><strong>Analitik:</strong> Memahami pola penggunaan untuk meningkatkan kualitas layanan.</li>
            </ul>
            <p className="text-sm text-text-muted mt-3">
              Kami <strong>tidak akan menjual, menyewakan, atau membagikan data pribadi Anda</strong> kepada pihak ketiga 
              tanpa persetujuan eksplisit, kecuali diwajibkan oleh hukum.
            </p>
          </section>

          {/* Hak Pengguna */}
          <section>
            <h2 className="text-xl font-bold text-text mb-3 flex items-center gap-2">
              <IconEye className="h-5 w-5 text-accent" />
              3. Hak Anda sebagai Pemilik Data
            </h2>
            <p className="text-text-muted mb-3">
              Sesuai UU PDP Pasal 5-7, Anda memiliki hak:
            </p>
            <ul className="list-disc pl-6 text-text-muted space-y-2">
              <li><strong>Mengakses:</strong> Melihat data pribadi yang kami miliki tentang Anda.</li>
              <li><strong>Memperbaiki:</strong> Memperbarui atau mengoreksi data yang tidak akurat.</li>
              <li><strong>Menghapus:</strong> Meminta penghapusan akun dan data pribadi Anda (right to be forgotten).</li>
              <li><strong>Membatasi pemrosesan:</strong> Meminta kami berhenti menggunakan data tertentu.</li>
              <li><strong>Portabilitas data:</strong> Mendapatkan salinan data Anda dalam format yang dapat dibaca mesin.</li>
            </ul>
            <p className="text-sm text-text-muted mt-3">
              Untuk menggunakan hak-hak ini, hubungi kami di{" "}
              <a href="mailto:privacy@notopati.id" className="text-primary hover:underline">
                privacy@notopati.id
              </a>
            </p>
          </section>

          {/* Keamanan Data */}
          <section>
            <h2 className="text-xl font-bold text-text mb-3">
              4. Keamanan Data
            </h2>
            <p className="text-text-muted mb-3">
              Kami menerapkan langkah-langkah teknis dan organisatoris untuk melindungi data Anda:
            </p>
            <ul className="list-disc pl-6 text-text-muted space-y-1">
              <li>Enkripsi password menggunakan algoritma bcrypt.</li>
              <li>Koneksi HTTPS untuk transmisi data aman.</li>
              <li>Akses terbatas ke database hanya untuk tim teknis yang berwenang.</li>
              <li>Audit keamanan berkala.</li>
            </ul>
            <p className="text-sm text-text-muted mt-3 italic">
              Namun, tidak ada sistem yang 100% aman. Kami mendorong Anda untuk menggunakan password yang kuat 
              dan tidak membagikannya kepada siapa pun.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-xl font-bold text-text mb-3">
              5. Penggunaan Cookies
            </h2>
            <p className="text-text-muted">
              Noto PATI menggunakan cookies untuk menjaga sesi login Anda dan mengingat preferensi. 
              Anda dapat menonaktifkan cookies melalui pengaturan browser, namun beberapa fitur platform 
              mungkin tidak berfungsi dengan baik.
            </p>
          </section>

          {/* Penyimpanan Data */}
          <section>
            <h2 className="text-xl font-bold text-text mb-3">
              6. Penyimpanan dan Penghapusan Data
            </h2>
            <ul className="list-disc pl-6 text-text-muted space-y-2">
              <li>
                <strong>Data akun:</strong> Disimpan selama akun aktif. Dapat dihapus permanen jika Anda menghapus akun.
              </li>
              <li>
                <strong>Data laporan:</strong> Disimpan untuk arsip publik. Laporan yang sudah dipublikasi tidak dapat 
                dihapus untuk menjaga transparansi, namun identitas pelapor tetap anonim.
              </li>
              <li>
                <strong>Backup data:</strong> Kami menyimpan backup selama 30 hari untuk pemulihan sistem darurat.
              </li>
            </ul>
          </section>

          {/* Perubahan Kebijakan */}
          <section>
            <h2 className="text-xl font-bold text-text mb-3">
              7. Perubahan Kebijakan Privasi
            </h2>
            <p className="text-text-muted">
              Kami dapat memperbarui kebijakan ini dari waktu ke waktu. Perubahan signifikan akan diberitahukan 
              melalui email atau notifikasi di platform. Tanggal pembaruan terakhir akan selalu tercantum di bagian atas halaman ini.
            </p>
          </section>

          {/* Kontak */}
          <section className="border-t border-border pt-6">
            <h2 className="text-xl font-bold text-text mb-3">
              Hubungi Kami
            </h2>
            <p className="text-text-muted mb-3">
              Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau ingin menggunakan hak-hak Anda:
            </p>
            <div className="p-4 rounded-lg bg-surface border border-border">
              <p className="text-sm text-text-muted">
                <strong className="text-text">Email:</strong>{" "}
                <a href="mailto:privacy@notopati.id" className="text-primary hover:underline">
                  privacy@notopati.id
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
              <strong>Catatan:</strong> Kebijakan privasi ini disusun untuk prototipe platform Noto PATI. 
              Implementasi produksi memerlukan konsultasi hukum dan penyesuaian dengan peraturan daerah setempat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
