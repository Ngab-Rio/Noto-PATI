# PRODUCT.md — Noto PATI

> **Visi strategis produk untuk keputusan desain Impeccable**

## Identitas Produk

**Nama:** Noto PATI  
**Tagline:** *Perhatian kecil, perubahan yang terasa*  
**Domain:** Civic Tech — Pelaporan Infrastruktur & Transparansi Anggaran  
**Konteks:** Kabupaten Pati, Jawa Tengah, Indonesia

---

## Pernyataan Masalah

Warga Kabupaten Pati tidak memiliki cara yang mudah dan transparan untuk melaporkan masalah infrastruktur (jalan rusak, drainase tersumbat, lampu PJU mati, jembatan rusak). Kanal pelaporan yang ada tidak transparan, terputus dari data anggaran, dan tidak memberikan pelacakan status yang jelas.

**Masalah Utama yang Diselesaikan:**
1. **Hambatan Pelaporan Infrastruktur**: Memudahkan warga melaporkan masalah infrastruktur dengan bukti foto dan data lokasi yang presisi
2. **Kesenjangan Transparansi Anggaran**: Menghubungkan laporan infrastruktur fisik dengan data belanja APBD sehingga warga memahami alokasi dan akuntabilitas
3. **Ketidakjelasan Status**: Menyediakan pelacakan status laporan secara real-time dan transparan dari pengajuan hingga penyelesaian

---

## Pengguna

### Audiens Utama

1. **Warga Kabupaten Pati (Pelapor)**
   - Dapat melaporkan secara anonim atau dengan autentikasi
   - Membutuhkan pengajuan yang sederhana dan cepat (kamera ponsel, lokasi, deskripsi)
   - Ingin melihat laporan mereka dilacak secara transparan
   - Peduli apakah masalah mereka diselesaikan

2. **Petugas/Administrator Pemerintah**
   - Memverifikasi, memproses, dan menanggapi laporan warga
   - Mengelola siklus hidup laporan (verifikasi, terima, proses, selesaikan, tolak, gabung)
   - Memberikan pembaruan dan catatan resmi kepada publik

3. **Masyarakat Umum (Pengamat)**
   - Menjelajahi laporan tanpa perlu login
   - Mengeksplorasi peta interaktif masalah infrastruktur
   - Melihat data alokasi anggaran APBD
   - Mendukung laporan yang sudah ada

---

## Brand & Nada Emosional

### Bagaimana Pengguna Seharusnya Merasakan

- **Terpercaya dan Transparan**: Seperti berinteraksi dengan institusi sipil yang dapat diandalkan dan memberi informasi
- **Mudah Diakses dan Ramah**: Tidak birokratis atau menakutkan — siapa saja bisa berpartisipasi
- **Memberdayakan**: Suara mereka penting, dan mereka bisa melihat kemajuan nyata
- **Profesional namun Hangat**: Keandalan kualitas pemerintah dengan pendekatan yang manusiawi

### Atmosfer

**Bersih, sipil, berakar Indonesia, berfokus komunitas**

Bahasa visual harus terasa:
- Modern tapi tidak korporat
- Serius tapi tidak dingin
- Lokal tapi tidak kampungan
- Kaya data tapi tidak membingungkan

---

## Pembeda Utama

Apa yang membuat Noto PATI unik:

### 1. **Validasi Geografis menggunakan Polygon PostGIS** ⭐
Validasi server-side memastikan laporan benar-benar berada dalam batas wilayah Kabupaten Pati menggunakan data polygon GeoJSON presisi dan PostGIS `ST_Covers`. Tidak ada lokasi palsu, tidak ada gangguan dari luar.

### 2. **Analisis Foto AI Opsional** ⭐
Warga dapat mendapatkan saran kategori dan deskripsi otomatis dari foto infrastruktur menggunakan model vision kompatibel OpenAI. Secara otomatis beralih ke input manual jika AI tidak tersedia atau terkena rate limit.

### 3. **Integrasi Transparansi Anggaran** ⭐
Setiap laporan infrastruktur terhubung secara kontekstual dengan data belanja APBD, membantu warga memahami kemana anggaran dialokasikan dan membuat pejabat bertanggung jawab.

### Fitur Pendukung
- Kemampuan pelaporan anonim (hambatan masuk lebih rendah)
- Badge status yang memenuhi WCAG AA untuk aksesibilitas
- Pelacakan status real-time dengan catatan resmi
- Tampilan peta publik tanpa perlu login
- Mobile-first dengan akses kamera dan geolokasi

---

## Prinsip Desain

1. **Bahasa Indonesia Sebagai Prioritas**  
   Semua copy UI, label, pesan error, dan konten menggunakan Bahasa Indonesia. Ini adalah alat sipil lokal untuk warga Kabupaten Pati.

2. **Aksesibilitas (WCAG AA)**  
   Badge status, kontras warna, navigasi keyboard, dan kompatibilitas screen reader memenuhi standar WCAG AA. Layanan sipil harus inklusif.

3. **Mobile-First**  
   Warga melaporkan di lapangan menggunakan ponsel. Akses kamera, geolokasi, dan form yang dioptimalkan untuk sentuhan adalah pola interaksi utama.

4. **Transparansi Secara Default**  
   Label simulasi data jelas. Status laporan terlihat. Data anggaran publik. Tidak ada proses tersembunyi.

5. **Performa & Efisiensi**  
   Waktu muat cepat (Next.js 15, Turbopack), gambar teroptimasi, JavaScript client minimal. Bekerja pada perangkat entry-level dan koneksi lambat.

6. **Privasi & Keamanan Data**  
   Penyimpanan foto bersifat privat dengan signed URL. Data personal mengikuti UU PDP (Undang-undang Perlindungan Data Pribadi Indonesia). Service role key tidak pernah terekspos.

7. **Progressive Enhancement**  
   Fitur inti (ajukan laporan, lihat laporan, lihat peta) bekerja tanpa JavaScript. Analisis foto AI bersifat opsional, bukan wajib.

---

## Ringkasan Sistem Desain Visual

**Warna:**
- Primary Blue: `#3B6EA5` (kepercayaan, otoritas sipil)
- Primary Dark: `#2F5F95`
- Primary Soft: `#E3EEF8`
- Accent Terracotta: `#A8532E` (hangat, nada tanah Indonesia)
- Accent Soft: `#FCEBDF`

**Tipografi:**
- Font: Poppins (sans-serif, bersih, modern, mudah dibaca)
- Hierarki: Ukuran heading jelas dengan responsive scaling yang terbatas

**Palet Status:**
Delapan warna status berbeda dengan kontras WCAG AA:
- Diterima (received) — Biru
- Diverifikasi (verified) — Teal
- Diproses (processing) — Kuning/Amber
- Selesai (completed) — Hijau
- Dibuka Kembali (reopened) — Oranye
- Ditolak (rejected) — Merah
- Digabung (merged) — Ungu
- Ditutup (closed) — Abu-abu

**Komponen:**
- Sudut membulat (`--radius: 0.625rem`)
- Bayangan halus untuk kedalaman
- Layout berbasis kartu
- Penggunaan ikon (Lucide, Phosphor)

---

## Di Luar Cakupan (untuk MVP)

- Dukungan multi-bahasa (Inggris, Jawa)
- Notifikasi real-time (email, SMS, push)
- Kemampuan PWA offline-first
- Aplikasi mobile native (iOS, Android)
- Integrasi dengan sistem pemerintah resmi
- Dashboard analitik lanjutan untuk warga
- Forum komunitas atau thread diskusi

---

## Metrik Kesuksesan

**Keterlibatan Pengguna:**
- Jumlah laporan yang diajukan per bulan
- Persentase laporan terautentikasi vs anonim
- Tingkat penyelesaian laporan (mulai form → berhasil submit)

**Dampak Transparansi:**
- Laporan dengan respon resmi
- Rata-rata waktu dari pengajuan hingga pembaruan resmi pertama
- Tampilan peta publik dan tampilan detail laporan

**Kualitas Teknis:**
- Akurasi validasi geografis (laporan dalam batas Pati)
- Tingkat keberhasilan analisis foto AI
- Performa muat halaman (Core Web Vitals)
- Skor audit aksesibilitas

---

## Dokumentasi Terkait

- **Arsitektur Teknis**: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- **Standar Pengembangan**: [`DEVELOPMENT.md`](./DEVELOPMENT.md)
- **Kebutuhan Produk**: [`PRD.md`](./PRD.md)
- **Cakupan Produk**: [`docs/PRODUCT_SCOPE.md`](./docs/PRODUCT_SCOPE.md)
- **Keamanan & Privasi**: [`docs/SECURITY.md`](./docs/SECURITY.md)

---

*Dokumen ini memandu semua pekerjaan desain Impeccable. Perbarui saat strategi produk berkembang.*
