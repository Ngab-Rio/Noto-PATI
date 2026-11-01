-- Halaman publik dan API peta menyaring status lalu mengurutkan created_at.
-- Tanpa index ini query-nya full scan saat jumlah laporan bertambah.
create index if not exists reports_status_created_at_idx
    on public.reports (status, created_at desc);

-- Daftar laporan publik diurutkan murni berdasarkan waktu terbaru.
create index if not exists reports_created_at_idx
    on public.reports (created_at desc);
