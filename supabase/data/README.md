# Data Batas Wilayah

## Kabupaten Pati

- File sumber: `pati.geojson` di root repository
- Feature: Kabupaten Pati, object ID `398`
- Kode PUM: `33.18`
- CRS: EPSG:4326
- Geometry: Polygon, dikonversi ke MultiPolygon saat disimpan
- Sumber/metadata: feature `BA03050040`, metadata `TASWIL5000020230907KABKOTA`
- Verifikasi: perlu dicatat oleh tim berdasarkan sumber resmi sebelum deployment produksi

Seed ke Supabase setelah migrasi:

```bash
npm run seed:region
```

Command tersebut membutuhkan `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` pada environment server. Script memvalidasi bahwa file berisi satu feature Polygon bernama Pati dengan CRS EPSG:4326 sebelum memanggil RPC seed.
