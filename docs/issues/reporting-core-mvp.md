---
name: Feature Request
about: Implementasi alur pelaporan kerusakan fasilitas publik
title: "feat: reporting core MVP"
labels: feature, reporting, core
assignees: ""
---

## Masalah yang Ingin Diselesaikan

Warga Kabupaten Pati membutuhkan alur pelaporan kerusakan fasilitas publik yang mudah digunakan dari perangkat mobile. Laporan harus dapat dibuat dengan foto kamera, lokasi perangkat, dan informasi kerusakan, lalu dapat dipantau secara publik tanpa membocorkan identitas pelapor.

Pelaporan tidak harus memerlukan akun. Pelapor anonim tetap menerima nomor tiket, sedangkan pengguna authenticated dapat melihat riwayat laporan miliknya sendiri.

## Solusi yang Diusulkan

Membangun alur pelaporan core MVP dengan:

- Form kategori, judul, deskripsi, dan detail lokasi.
- Pengambilan 1 sampai 3 foto melalui kamera perangkat.
- Permission kamera dan lokasi sebagai prasyarat pengambilan foto.
- Kompresi foto client-side sebelum upload.
- Pengambilan latitude, longitude, akurasi, dan waktu lokasi.
- Validasi client dan server menggunakan Zod.
- Penyimpanan laporan dan metadata foto di Supabase.
- Bucket foto private dengan signed URL server-side untuk detail publik.
- Status awal `diterima` dan status history otomatis.
- Idempotency untuk mencegah duplikasi akibat retry teknis.
- Daftar dan detail laporan publik untuk laporan anonymous maupun authenticated.
- Riwayat laporan pribadi untuk user authenticated.
- Filter laporan publik berdasarkan kategori, status, dan pencarian judul/lokasi.

Validasi polygon Kabupaten Pati menggunakan sumber polygon resmi dan PostGIS menjadi dependency lanjutan setelah sumber polygon diverifikasi.

## Manfaat

- Warga dapat melaporkan kerusakan tanpa alur yang rumit.
- Pelapor anonymous tetap dapat melacak laporan melalui nomor tiket/detail publik.
- Warga authenticated dapat memantau riwayat laporan sendiri.
- Publik dapat melihat laporan dan status tanpa mengetahui identitas pelapor.
- Foto tetap terlindungi karena bucket tidak dibuat public.
- Kegagalan jaringan atau upload tidak menghilangkan data form dan tidak membuat duplikasi teknis.

## Kriteria Penerimaan

- [x] Pengunjung dan user authenticated dapat membuat laporan.
- [x] User dapat mengambil 1 sampai 3 foto melalui kamera perangkat.
- [x] Permission kamera dan lokasi ditangani dengan pesan error yang jelas.
- [x] Foto dikompres, divalidasi, diupload ke bucket private, dan metadata tersimpan di `report_photos`.
- [x] Laporan tersimpan di `reports` dengan nomor tiket dan status awal `diterima`.
- [x] Riwayat status awal tercatat di `report_status_history`.
- [x] User authenticated hanya dapat melihat riwayat laporan miliknya sendiri.
- [x] Laporan anonymous dan authenticated dapat dilihat pada daftar/detail publik tanpa identitas pelapor.
- [x] Foto detail publik disajikan menggunakan signed URL server-side.
- [x] Filter publik kategori, status, dan pencarian judul/lokasi berfungsi.
- [x] Retry teknis tidak membuat laporan atau foto duplikat.
- [x] Timeout dan kegagalan upload menampilkan error tanpa menghapus state form.
- [ ] Koordinat divalidasi terhadap polygon resmi Kabupaten Pati menggunakan PostGIS.
- [ ] Automated test untuk alur sukses, kegagalan, retry, RLS, dan validasi wilayah.

## Catatan Tambahan

- Laporan publik tidak mengekspos `reporter_id` atau `changed_by`.
- Foto tetap berada di bucket private `report-photos`.
- Automatic duplicate detection berbasis kemiripan foto/teks dan AI auto-fill berada di luar scope core MVP.
- Dukungan laporan, rating, notifikasi, dashboard admin/OPD, dan peta marker/clustering mengikuti scope issue terpisah.
- Acceptance criteria "hanya pengguna authenticated yang dapat mengirim laporan" diganti karena keputusan produk terbaru mengizinkan anonymous reporting.
- Polygon resmi Kabupaten Pati belum tersedia di repository dan tidak boleh digantikan dengan bounding box perkiraan.
