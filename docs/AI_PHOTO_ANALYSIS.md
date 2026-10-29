# Analisis Foto untuk Saran Laporan

Analisis foto merupakan bantuan opsional dan hanya berjalan setelah pengguna
menekan tombol **Analisis dengan AI**. Foto pertama yang berhasil diproses
dikirim ke provider vision yang telah dikonfigurasi. Saran hanya mengisi field
yang masih kosong dan belum diedit manual. Pengguna tetap dapat mengedit semua
field, dan laporan tetap dapat dibuat secara manual jika provider tidak
tersedia atau gagal.

## Konfigurasi provider vision

Isi seluruh environment variable server berikut untuk mengaktifkan analisis:

```env
AI_VISION_BASE_URL=https://api.openai.com/v1
AI_VISION_API_KEY=secret-server-side-key
AI_VISION_MODEL=vision-model
```

`AI_VISION_BASE_URL` adalah base URL API yang kompatibel dengan format
OpenAI Chat Completions. Endpoint aplikasi menambahkan `/chat/completions`.
Jangan memakai awalan `NEXT_PUBLIC_` atau mengirim API key ke browser. Jika
konfigurasi tidak tersedia, endpoint menolak analisis dengan pesan yang
mengarahkan pengguna ke jalur manual.

Sebelum mengaktifkan konfigurasi pada production, tinjau kebijakan privasi,
retensi, dan penggunaan data provider untuk memastikan pengiriman foto warga
diizinkan. Beri tahu pengguna agar tidak menyertakan wajah atau pelat nomor
yang tidak relevan.

Provider menerima foto JPEG, PNG, atau WEBP maksimal 5 MB. Endpoint menetapkan
**timeout 30 detik** untuk permintaan analisis vision ke provider eksternal. Jika
provider tidak merespons dalam waktu tersebut, analisis akan gagal dengan kode
error `timeout` dan pengguna dapat mencoba lagi atau melanjutkan pengisian manual.

Client-side (browser) juga menerapkan **timeout 35 detik** untuk keseluruhan request
termasuk overhead network, sehingga memberikan sedikit buffer di atas server timeout.

Endpoint membatasi lima analisis per alamat jaringan per jam. Hash foto dan hasil
analisis disimpan tanpa menyimpan konten gambar. Tabel metadata dan tabel pembatasan
aksesnya tidak dapat dibaca oleh role `anon` atau `authenticated`; tabel rate limit
menyimpan hash requester sementara dan dibersihkan saat permintaan baru masuk.

### Environment Variable Sementara untuk Development

⚠️ **CATATAN PENTING:** Variable `AI_ANALYSIS_ALLOWED_ORIGINS` adalah **TEMPORARY**
dan hanya digunakan untuk development/testing dengan tunnel (ngrok, localtunnel,
VS Code dev tunnels). Variable ini **AKAN DIHAPUS** saat aplikasi di-deploy ke
production.

Untuk akses melalui reverse proxy atau dev tunnel selama development, tambahkan
origin publik secara eksplisit ke environment server:

```env
# ⚠️ TEMPORARY - akan dihapus di production
AI_ANALYSIS_ALLOWED_ORIGINS=https://your-tunnel.example
```

Origin tunnel harus ditambahkan eksplisit ke allow-list:

```env
# ⚠️ TEMPORARY - akan dihapus di production
AI_ANALYSIS_ALLOWED_ORIGINS=https://your-tunnel.example,http://localhost:3000
```

Pisahkan beberapa origin dengan koma. Nilainya harus origin saja (scheme dan
host, tanpa path), lalu restart server setelah mengubah konfigurasi.

**Production Deployment:**
- Variable `AI_ANALYSIS_ALLOWED_ORIGINS` harus **DIHAPUS** dari environment
- Aplikasi production hanya akan menerima request dari `NEXT_PUBLIC_APP_URL`
- Security check akan menggunakan production URL yang telah dikonfigurasi
- Tidak ada origin tambahan yang diizinkan untuk mencegah abuse

## Pengisian lokasi dari koordinat

Setelah foto dipilih, aplikasi meminta izin lokasi perangkat dan melakukan
reverse-geocoding koordinat GPS saat ini ke perkiraan alamat melalui server
Nominatim OpenStreetMap. Endpoint menetapkan **timeout 10 detik** untuk request
ke OSM Nominatim, dan client-side menerapkan **timeout 15 detik** untuk keseluruhan
request. Jika timeout tercapai, pengguna akan menerima pesan error yang jelas dan
dapat mencoba lagi atau melanjutkan pengisian manual.

Lokasi tidak ditebak dari foto atau metadata fotonya. Koordinat dikirim ke layanan
tersebut; hasilnya hanya mengisi field lokasi yang kosong dan belum diedit pengguna.
Jika izin lokasi ditolak atau pencarian gagal, foto tetap dipilih, pengguna dapat
mencoba deteksi lokasi lagi, dan pesan kegagalan ditampilkan. Pengguna tetap harus
memeriksa dan dapat mengubah alamat. Form menampilkan atribusi OpenStreetMap.

Aplikasi memakai cache koordinat selama 30 hari dan membatasi panggilan
cache-miss secara global menjadi maksimal satu permintaan per detik sesuai
kebijakan layanan publik Nominatim. Terapkan migrasi
`supabase/migrations/20261028110000_add_reverse_geocode_cache.sql`.
Untuk production dengan trafik berarti, evaluasi layanan geocoding mandiri atau
provider lain; layanan publik OSM bukan SLA production.

## Alur pengguna dan keterbatasan

- Analisis hanya dimulai setelah pengguna menekan tombol **Analisis dengan AI**.
- Saran AI hanya mengisi field kosong yang belum diedit manual; semua field
  tetap dapat diubah pengguna.
- Pemilihan foto memicu permintaan lokasi perangkat, terpisah dari analisis AI.
- Saran tidak pernah mengirim laporan.
- Model diminta tidak menebak lokasi, jalan, penyebab, waktu, dampak, atau bahaya
  yang tidak terlihat. Hasil tetap dapat keliru dan harus diperiksa pengguna.
- Confidence, jika tersedia, ditampilkan sebagai informasi saja. Belum ada
  threshold yang digunakan karena model belum dievaluasi dengan dataset foto
  berlabel.
- `PhotoClassifier` adalah kontrak untuk integrasi classifier terpisah. Adapter
  Roboflow belum diaktifkan; kategori pada implementasi awal berasal dari
  provider vision yang sama dengan saran teks.

## Supabase

Terapkan migrasi
`supabase/migrations/20261028100000_add_report_ai_analyses.sql` sebelum
mengaktifkan endpoint. Migrasi membatasi akses metadata ke `service_role` dan
menyediakan RPC server-only untuk rate limiting atomik.
