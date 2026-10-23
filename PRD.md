# PRD Noto PATI

Oct 22, 2026 · @RADITYA

## Ringkasan produk

Noto PATI adalah web pelaporan infrastruktur untuk warga Kabupaten Pati yang menghubungkan laporan warga dengan anggaran daerah (APBD 2025). Warga melapor jalan rusak, drainase tersumbat, atau lampu jalan mati lewat foto dan lokasi. AI membantu mengklasifikasi laporan dan menandai laporan ganda. OPD menindaklanjuti dalam batas waktu (SLA) yang terlihat publik. Halaman Anggaran menjelaskan APBD dengan bahasa warga.

- **Nama:** Noto PATI. "Noto" dalam bahasa Jawa berarti menata.
- **Wilayah:** Kabupaten Pati saja.
- **Subtema lomba:** Civic Reporting & Accountability, dengan unsur data anggaran.
- **Platform:** web, mobile-first, dibangun dengan Next.js.
- **Pembeda:** laporan warga dan anggaran daerah berada dalam satu tempat, bukan sekadar kanal aduan baru.

## Latar belakang dan masalah

Kanal aduan warga sudah ada, tetapi kejelasan tindak lanjut dan keterkaitannya dengan anggaran daerah masih lemah. Noto PATI tidak bersaing dengan kanal nasional seperti SP4N-LAPOR atau JAKI. Ia mengisi tiga celah di tingkat kabupaten.

1. **Laporan tanpa kepastian.** Monitoring Ombudsman Kepri (Mei 2024) menemukan aduan yang sama berulang tanpa evaluasi pemda dan sebagian laporan menggantung di status "on progress" ([Ombudsman](https://ombudsman.go.id/news/download/pwksiaran--monitoring-laporan-sp4n-lapor-ombudsman-kepri-menilai-pemda-belum-maksimal-lakukan-evaluasi)). Jakarta menjawabnya dengan sanksi bagi petugas yang tidak merespons dalam 6 hari ([Rakyat Merdeka, 2025](https://rm.id/baca-berita/megapolitan/267503/pns-dki-terancam-potong-tkd-jika-abaikan-laporan-warga-di-aplikasi-jaki)). Noto PATI menampilkan SLA yang sama secara terbuka untuk OPD di Pati.
2. **Laporan ganda.** Warga yang melapor lubang yang sama menumpuk di antrean petugas. Noto PATI menggabungkannya menjadi satu laporan dengan jumlah pendukung.
3. **Anggaran sulit dipahami.** APBD Pati 2025 ada dalam bentuk Perda dan Perbup berformat PDF dengan lampiran tabel panjang: [Perda 12/2024](https://jdih.patikab.go.id/asset/files/0d933b64f7af66e50355e7b66938095d.pdf) (belanja Rp2,94 triliun), [Perda 2/2025](https://peraturan.bpk.go.id/Details/330078) (perubahan, total Rp3,12 triliun), dan [Perbup 37/2025](https://peraturan.bpk.go.id/Details/332947). Warga sulit menghubungkan masalah di lingkungannya dengan uang yang dianggarkan untuknya.

## Tujuan dan metrik keberhasilan

Tujuan produk: warga Pati bisa melapor dengan mudah, melihat kepastian tindak lanjut, dan memahami ke mana anggaran daerah dibelanjakan. Target di bawah adalah usulan untuk prototipe lomba, diukur lewat data uji dan pengujian dengan sekitar 10 penguji.

| Tujuan | Metrik | Target usulan |
| --- | --- | --- |
| Pelaporan mudah | Waktu dari buka form sampai laporan terkirim | Kurang dari 2 menit |
| Data laporan rapi | Laporan ganda yang disarankan digabung pada 30 laporan uji | 80% atau lebih |
| AI berguna | Kategori foto yang benar pada 30 foto uji | 80% atau lebih |
| Tindak lanjut jelas | Laporan dengan status dan SLA yang tampil | 100% |
| Anggaran bisa dipercaya | Angka anggaran yang menyertakan dokumen dan halaman sumber | 100% |
| Partisipasi | Penguji yang menyelesaikan satu Misi Cek Anggaran | 50% atau lebih |

**Keterkaitan SDGs** (pemetaan penulis, cek ke dokumen Bappenas sebelum masuk proposal): SDG 16 (institusi yang transparan, akuntabel, dan partisipatif), SDG 11 (permukiman yang berkelanjutan), SDG 9 (infrastruktur), dan SDG 17 (kolaborasi warga dan pemerintah).

## Pengguna dan peran

Empat peran memakai Noto PATI. Hak akses dikendalikan lewat peran akun.

| Peran | Siapa | Kebutuhan utama | Akses |
| --- | --- | --- | --- |
| Pengunjung | Siapa pun tanpa akun | Melihat peta laporan, status, dan halaman Anggaran | Baca saja |
| Warga | Penduduk Pati dengan akun | Melapor cepat, memantau laporannya, mendukung laporan lain, ikut misi dan peringkat | Buat laporan, dukung, beri rating |
| Petugas OPD | Staf dinas terkait (misalnya PUPR, Perkim, Dishub) | Antrean laporan untuk dinasnya, batas waktu, tempat mengunggah bukti perbaikan | Ubah status laporan OPD-nya |
| Admin | Tim pengelola Noto PATI | Memverifikasi laporan, menyetujui penjelasan anggaran dari AI, mengelola data | Akses penuh |

Pada prototipe lomba, akun petugas OPD dan admin disimulasikan oleh tim dengan data demo.

## Ruang lingkup

MVP lomba memuat alur laporan dari awal sampai selesai, satu halaman Anggaran yang kuat. Fitur lain ditunda agar dua halaman wajib untuk proposal (landing page dan satu halaman lain) cepat jadi.

| Kelompok | Isi |
| --- | --- |
| **MVP (P0 dan P1)** | Akun dan peran; buat laporan dengan foto dan lokasi; peta laporan publik; klasifikasi foto dan deteksi laporan ganda oleh AI; status dan SLA; dashboard admin dan OPD sederhana; halaman Anggaran APBD Pati 2025 untuk belanja infrastruktur dengan penjelasan AI berkutipan; kaitan laporan dan anggaran per kategori di tingkat kabupaten; poin, lencana, dan papan peringkat kecamatan |
| **Tahap lanjut** | Skor akuntabilitas OPD otomatis lengkap; Misi Cek Anggaran (kuis); notifikasi WhatsApp atau email; prediksi titik rawan; PWA dengan mode offline; kaitan anggaran dan laporan per kecamatan |
| **Di luar lingkup** | Integrasi resmi dengan sistem pemerintah (SP4N-LAPOR, SIPD); data bansos atau data pribadi penerima; pembayaran; aplikasi native |

## Kebutuhan fungsional

Prioritas: **P0** wajib ada di MVP, **P1** sebaiknya ada, **P2** dikerjakan bila waktu cukup. Nomor kebutuhan dipakai juga untuk menyusun tugas pengerjaan.

| ID | Kebutuhan | Kriteria penerimaan | Prioritas |
| --- | --- | --- | --- |
| FR-01 | Warga mendaftar dan masuk | Masuk dengan email atau akun Google; sesi bertahan; peran tersimpan di akun | P0 |
| FR-02 | Warga membuat laporan | Maksimal 3 foto; pin lokasi GPS yang bisa digeser; kategori dan deskripsi; lokasi harus di dalam batas Kabupaten Pati; status awal Diterima | P0 |
| FR-03 | Peta laporan publik | Penanda berwarna menurut status; filter kategori, kecamatan, dan status; penanda berdekatan dikelompokkan | P0 |
| FR-04 | Detail dan pelacakan laporan | Linimasa status, foto sebelum dan sesudah, sisa waktu SLA, jumlah pendukung | P0 |
| FR-05 | Warga mendukung laporan | Satu dukungan per akun per laporan | P1 |
| FR-06 | Dashboard admin dan OPD | Antrean laporan; admin memverifikasi atau menolak dengan alasan; OPD menugaskan petugas, mengubah status, dan mengunggah foto bukti; setiap perubahan tercatat di riwayat | P0 |
| FR-07 | SLA dan eskalasi | Batas waktu per kategori; laporan yang melewatinya ditandai di halaman publik | P1 |
| FR-08 | Rating dan buka kembali | Warga memberi rating 1 sampai 5 setelah Selesai, atau membuka kembali laporan yang belum beres | P1 |
| AI-01 | Klasifikasi foto | AI mengusulkan kategori dan tingkat kerusakan beserta tingkat keyakinan; warga bisa mengubahnya; bila AI gagal, form manual tetap berjalan | P0 |
| AI-02 | Deteksi laporan ganda | Sistem mencari laporan serupa dalam radius tertentu dan menyarankan penggabungan; warga yang memutuskan | P0 |
| AI-03 | Skor urgensi | Skor 0 sampai 100 dengan alasan singkat (misalnya dekat sekolah); admin bisa menimpa | P1 |
| AI-04 | Penjelas anggaran | Setiap angka menyertakan nama dokumen dan halaman; ada label "pagu, bukan realisasi"; penjelasan baru tampil publik setelah disetujui admin | P0 |
| BG-01 | Ringkasan APBD Pati 2025 | Menampilkan versi murni dan perubahan berdampingan, dengan total yang cocok dengan dokumen | P0 |
| BG-02 | Belanja per OPD dan program | Tabel dan grafik untuk belanja infrastruktur; filter OPD dan jenis belanja | P0 |
| BG-03 | Kaitan anggaran dan laporan | Jumlah laporan satu kategori ditampilkan berdampingan dengan pagu kategori terkait; per kecamatan bila data lokasi tersedia, jika tidak per kabupaten | P1 |
| BG-04 | Impor dan verifikasi data anggaran | Admin mengunggah hasil ekstraksi; total hasil impor harus cocok dengan total di batang tubuh dokumen sebelum dipublikasikan | P0 |
| GM-01 | Poin | Poin dicatat di buku poin; poin laporan baru cair setelah diverifikasi | P1 |
| GM-02 | Lencana | Lencana per bidang (jalan, drainase, penerangan, anggaran) dengan syarat yang jelas | P1 |
| GM-03 | Papan peringkat | Peringkat kecamatan untuk semua; peringkat individu hanya bagi yang memilih ikut, dengan alias | P1 |
| GM-04 | Misi Cek Anggaran | Warga membaca penjelasan anggaran lalu menjawab kuis singkat untuk mendapat poin | P2 |

**Aturan poin awal (usulan, diuji lalu disetel):** laporan lengkap dan terverifikasi +20; laporan sampai Selesai +30; konfirmasi perbaikan oleh warga +10; dukungan +2 (maksimal 5 per hari); kuis anggaran +10; laporan palsu atau duplikat yang disengaja -20.

## Kebutuhan non-fungsional

| Aspek | Kebutuhan |
| --- | --- |
| Performa | Halaman publik terbuka kurang dari 3 detik di jaringan 4G; foto dikompres di sisi klien sebelum diunggah (sekitar 1 MB per foto); peta memuat penanda per wilayah yang terlihat |
| Keamanan | Hak akses berdasarkan peran; validasi input di server; pembatasan laju (rate limit) pada pembuatan laporan dan pemanggilan AI; kunci API hanya di server |
| Privasi | Mengumpulkan data seminimal mungkin sesuai UU PDP 27/2022; identitas pelapor tidak tampil publik dan pelaporan anonim opsional; metadata lokasi (EXIF) di foto dihapus; peringatan agar tidak memotret wajah atau plat nomor |
| Aksesibilitas | Kontras teks memenuhi WCAG AA; form berlabel; dapat dipakai dengan keyboard; bahasa Indonesia sederhana |
| Keandalan | Penjelasan AI disimpan (cache) agar tidak dihitung ulang; bila layanan AI gagal, form manual dan halaman anggaran tetap berfungsi; cadangan basis data berkala |
| Ketelusuran data | Setiap angka anggaran menautkan ke dokumen sumber, nomor halaman, dan tanggal impor |
| Tampilan | Mobile-first, karena sebagian besar warga melapor dari ponsel di lokasi kerusakan |

## Alur pengguna dan model data

Flowchart (alur laporan, alur anggaran, status laporan) dan empat ERD ada di halaman [Diagram Noto PATI](https://claude.ai/artifact/8P6yWMnQCNmwADCtkPqZvu). Model data terdiri dari 21 tabel: 12 tabel pelaporan, 3 tabel anggaran.

**Status laporan:** Diterima, Digabung, Ditolak, Diverifikasi, Diproses, Selesai, Dibuka Kembali, Ditutup.

**Aturan bisnis penting**

| Aturan | Ketentuan |
| --- | --- |
| Batas wilayah | Lokasi laporan harus berada di dalam Kabupaten Pati; di luar itu ditolak saat pengiriman |
| Laporan ganda | Laporan baru dalam radius tertentu dengan kategori dan foto yang mirip disarankan digabung; penggabungan menambah pendukung, bukan membuat laporan baru |
| Verifikasi | Laporan baru diteruskan ke OPD setelah admin menyatakan valid; yang ditolak wajib beralasan |
| SLA | Setiap kategori punya batas waktu respons; yang melewatinya dieskalasi dan ditandai publik |
| Penutupan | Laporan Selesai menunggu konfirmasi warga; bila warga tidak puas, laporan dibuka kembali |
| Poin | Poin laporan cair setelah verifikasi; laporan palsu atau duplikat yang disengaja dikenai penalti |
| Anggaran | Yang ditampilkan adalah pagu; realisasi hanya bila datanya ada; penjelasan AI baru publik setelah disetujui admin |

## Arsitektur dan tech stack

Satu aplikasi Next.js (App Router, TypeScript) melayani halaman publik, form warga, dan dashboard admin. Basis data, autentikasi, dan penyimpanan foto memakai satu layanan terkelola agar tim kecil tidak mengurus server. Layanan AI dipanggil hanya dari server. Ekstraksi PDF APBD dikerjakan sebagai skrip terpisah di luar aplikasi.

&#91;embedded content: arsitektur · 4 komponen dan 1 skrip terpisah\]

Pengguna hanya berbicara dengan aplikasi Next.js, yang membaca dan menulis data di Supabase serta memanggil API AI. Hasil ekstraksi APBD masuk lewat unggahan admin.

| Lapisan | Pilihan | Alasan |
| --- | --- | --- |
| Framework | Next.js (App Router) dengan TypeScript. Pasang versi stabil terbaru dan kunci di package.json | Server Components untuk halaman publik yang cepat; Route Handlers dan Server Actions untuk API dan aksi form |
| Tampilan | Tailwind CSS dan shadcn/ui | Komponen aksesibel siap pakai, cepat dirakit |
| Peta | Leaflet (react-leaflet) dengan ubin OpenStreetMap | Gratis, sederhana, mendukung pengelompokan penanda |
| Grafik | Recharts | Grafik anggaran yang cukup untuk MVP |
| Basis data | PostgreSQL dengan ekstensi PostGIS (radius dan batas wilayah) dan pgvector (kemiripan laporan) | Satu basis data untuk data, geospasial, dan embedding |
| Layanan terkelola | Supabase (Postgres, Auth, Storage) atau Neon dengan Auth.js; pilih salah satu | Mengurangi pekerjaan infrastruktur; cek kuota paket gratis sebelum memutuskan |
| ORM | Drizzle atau Prisma; kueri PostGIS memakai SQL mentah | Skema bertipe dan migrasi |
| Validasi | Zod dan React Hook Form | Validasi yang sama di klien dan server |
| AI | API model bahasa dengan kemampuan membaca gambar (Claude atau Gemini) dan model embedding, dipanggil dari Route Handler | Klasifikasi foto, penjelas anggaran, dan kemiripan laporan; hasil disimpan agar murah |
| Tugas terjadwal | Vercel Cron atau pg\_cron | Cek SLA dan hitung skor OPD berkala |
| Hosting | Vercel untuk aplikasi, layanan terkelola untuk data | Penerapan Next.js paling mulus; pratinjau per cabang |
| Pengujian | Vitest untuk aturan bisnis; Playwright untuk satu alur utama | Cukup untuk menjaga alur laporan tidak rusak saat demo |

**Integrasi AI.** Angka anggaran dihitung oleh kode dan diambil dari tabel, bukan ditebak model. Model hanya menjelaskan angka yang sudah ada, dengan kutipan dokumen dan halaman. Foto dikirim ke penyedia AI setelah metadata EXIF dihapus. Paket gratis Gemini menyatakan prompt dapat dipakai Google untuk memperbaiki produknya, jadi jangan kirim foto yang mungkin memuat wajah atau plat nomor lewat paket itu. Cek harga dan kebijakan terbaru penyedia sebelum memilih.

**Ekstraksi APBD.** Skrip terpisah (Python atau Node) membaca PDF lampiran, mengekstrak tabel ke CSV, lalu admin mengunggah dan memverifikasinya lewat halaman impor. Bila PDF berupa hasil pindai, tahap OCR ditambahkan.

**Struktur proyek** — Struktur folder lengkap dan final ada di [ARCHITECTURE.md § 8. Struktur Folder](./ARCHITECTURE.md). Ringkasan lapisan `src/`:

| Lapisan | Folder | Tanggung jawab |
| --- | --- | --- |
| Routing | `src/app/` | Tipis — hanya routing, layout, dan komposisi halaman |
| Fitur | `src/features/` | Komponen, actions, queries, dan schema per fitur |
| Domain | `src/domain/` | Aturan bisnis murni TypeScript (status, SLA, kategori) |
| Server | `src/server/` | Infrastruktur server-only (Supabase client, guards, AI, signed URL) |
| Utilitas | `src/lib/` | Helper yang aman dipakai di sisi klien maupun server |
| Database | `supabase/migrations/` | Skema, RLS, RPC, trigger, view sebagai migrasi SQL |

## Rencana pengerjaan

Jadwal di bawah memakai urutan minggu relatif, karena tanggal batas pengumpulan proposal dan final belum diketahui (lihat pertanyaan terbuka). Estimasi waktu adalah perkiraan untuk tim kecil. Dokumen proposal butuh screenshot landing page dan satu halaman lain, jadi keduanya dikerjakan lebih dulu.

| Tahap | Pekerjaan | Kriteria selesai |
| --- | --- | --- |
| 1. Persiapan (minggu 1) | Gerbang cek data APBD (unduh PDF, cek apakah teksnya bisa diekstrak); buat repo Next.js; siapkan basis data, autentikasi, dan skema | Keputusan jalur ekstraksi APBD sudah diambil; login berjalan; skema termigrasi |
| 2. Landing dan pelaporan inti (minggu 1 sampai 2) | Landing page; form laporan dengan foto dan lokasi; peta; halaman detail | Laporan bisa dibuat dan tampil di peta; dua halaman siap di-screenshot |
| 3. Alur tindak lanjut (minggu 2 sampai 3) | Dashboard admin dan OPD; perubahan status; SLA | Alur Diterima sampai Selesai berjalan ujung ke ujung |
| 4. AI pelaporan (minggu 3) | Klasifikasi foto; deteksi ganda; skor urgensi | 80% atau lebih benar pada 30 foto uji |
| 5. Anggaran (minggu 3 sampai 4, paralel) | Ekstraksi dan impor; halaman Anggaran; penjelas AI | Total hasil impor cocok dengan total di dokumen |
| 6. Polesan dan demo (minggu 5 sampai 6) | Data demo yang realistis; perbaikan UI; pengujian dengan penguji; dokumen proposal | Demo berjalan tanpa galat dua kali berturut-turut |

## Risiko dan asumsi

Risiko terbesar ada di data anggaran, karena lampiran rincian APBD berupa PDF dan belum dicek bentuknya.

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Lampiran APBD berupa hasil pindai atau tabel sulit diekstrak | Angka anggaran salah atau tidak lengkap | Lakukan gerbang cek data di minggu 1; wajib mencocokkan total; mulai dari subset belanja infrastruktur; bila gagal, tampilkan ringkasan dari batang tubuh (total pendapatan, belanja, defisit) |
| Yang tersedia hanya pagu, bukan realisasi | Kesimpulan menyesatkan | Beri label "pagu, bukan realisasi"; gunakan bahasa netral dan jangan menyebut boros atau korupsi |
| Foto gelap atau buram membuat AI salah kategori | Laporan salah rute | Warga bisa mengubah kategori; tampilkan tingkat keyakinan; admin memverifikasi |
| Laporan palsu, spam, atau memburu poin | Data kotor dan peringkat tidak adil | Poin cair setelah verifikasi; batas harian; hash foto untuk mendeteksi foto yang sama; penalti; rate limit |
| Foto memuat wajah, plat nomor, atau lokasi rumah | Pelanggaran privasi | Hapus EXIF; peringatan di form; pelapor anonim opsional; blur otomatis bila sempat |
| Kuota dan biaya layanan (AI, basis data, hosting) habis saat demo | Demo terhenti | Simpan hasil AI; batasi panggilan per pengguna; siapkan data demo; cek kuota paket gratis lebih awal |
| Tidak ada OPD sungguhan yang memakai sistem | Tindak lanjut hanya simulasi | Jelaskan sebagai prototipe; tandai data demo dengan jelas |
| Data batas kecamatan Pati tidak tersedia rapi | Pemeriksaan wilayah dan kaitan per kecamatan sulit | Cari batas wilayah di OpenStreetMap atau data resmi, gunakan kode wilayah Kemendagri; bila tidak ada, tampilkan per kabupaten |

**Asumsi:** ini prototipe lomba, bukan sistem produksi pemerintah; dokumen APBD adalah dokumen publik; sebagian besar pengguna memakai ponsel; layanan AI dipanggil lewat API pihak ketiga.

## Pertanyaan terbuka dan lampiran

**Perlu dipastikan sebelum membangun**

- [ ] Tanggal batas pengumpulan proposal dan jadwal final MIA 2026, termasuk format nama file dokumen (panduan menyebut kode WIA\_FDSMIA2025, sementara situs panitia memakai mia2026).
- [ ] Kriteria penilaian juri MIA 2026.
- [ ] Apakah lampiran PDF Perda 12/2024 dan Perbup 37/2025 bisa diekstrak sebagai teks, atau berupa hasil pindai.
- [ ] Apakah data realisasi APBD Pati 2025 tersedia (belum dicek).
- [ ] Kanal aduan yang sudah ada di Pati, agar pembeda Noto PATI akurat.
- [ ] Data batas kecamatan Pati (OpenStreetMap atau sumber resmi).
- [ ] Konteks lokal Pati sepanjang 2025 yang akan dipakai di narasi proposal; belum diverifikasi, cari sumber resmi atau berita sebelum dikutip.
- [ ] Keahlian tim, untuk menentukan pilihan Supabase atau Neon dan Drizzle atau Prisma.

**Lampiran**

- [Diagram Noto PATI](https://claude.ai/artifact/8P6yWMnQCNmwADCtkPqZvu): flowchart dan ERD
- Dokumen APBD: [Perda Pati 12/2024](https://jdih.patikab.go.id/asset/files/0d933b64f7af66e50355e7b66938095d.pdf), [Perda Pati 2/2025](https://peraturan.bpk.go.id/Details/330078), [Perbup Pati 37/2025](https://peraturan.bpk.go.id/Details/332947)
- [Monitoring SP4N-LAPOR oleh Ombudsman Kepri](https://ombudsman.go.id/news/download/pwksiaran--monitoring-laporan-sp4n-lapor-ombudsman-kepri-menilai-pemda-belum-maksimal-lakukan-evaluasi)
- [Sanksi JAKI untuk aduan tak direspons](https://rm.id/baca-berita/megapolitan/267503/pns-dki-terancam-potong-tkd-jika-abaikan-laporan-warga-di-aplikasi-jaki)
