-- ============================================================================
-- Migration: Create Noto PATI Care Infrastructure Education Schema & Seed Data
-- Version: 20261106120000
-- ============================================================================

create table if not exists public.care_articles (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    category public.report_category not null,
    title text not null,
    summary text not null,
    content text not null,
    causes text[] not null default '{}',
    impacts text[] not null default '{}',
    safety_actions text[] not null default '{}',
    prevention_steps text[] not null default '{}',
    references jsonb not null default '[]'::jsonb,
    reviewed_at timestamptz not null default now(),
    is_published boolean not null default true,
    read_time_minutes integer not null default 3,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists care_articles_category_idx
    on public.care_articles (category)
    where is_published = true;

create index if not exists care_articles_slug_idx
    on public.care_articles (slug);

create index if not exists care_articles_published_idx
    on public.care_articles (is_published, reviewed_at desc);

-- Row Level Security (RLS)
alter table public.care_articles enable row level security;

drop policy if exists "Public can view published care articles" on public.care_articles;
create policy "Public can view published care articles"
    on public.care_articles
    for select
    to anon, authenticated
    using (is_published = true);

-- Grant select to anon & authenticated roles
grant select on table public.care_articles to anon, authenticated;

-- ============================================================================
-- Seed 5 Curated Infrastructure Education Articles for Kabupaten Pati
-- ============================================================================

insert into public.care_articles (
    slug,
    category,
    title,
    summary,
    content,
    causes,
    impacts,
    safety_actions,
    prevention_steps,
    references,
    reviewed_at,
    is_published,
    read_time_minutes
) values
(
    'jalan-berlubang-dan-amblas',
    'jalan',
    'Mengenal Jalan Berlubang, Penurunan Badan Jalan, dan Tindakan Pengamanan Dini',
    'Panduan mengenali faktor penyebab kerusakan aspal, bahaya keselamatan bagi pengendara, serta langkah aman memberi penanda visual tanpa membahayakan diri sendiri.',
    'Jalan berlubang (pothole) dan amblasnya badan jalan merupakan salah satu kerusakan infrastruktur yang paling sering dijumpai di jalur transportasi Kabupaten Pati, terutama di ruas poros kecamatan dan jalur logistik Pantura. Kerusakan ini bermula dari retak rambut pada permukaan aspal yang kemasukan air hujan. Air yang terperangkap melunakkan pondasi agregat di bawah aspal, sehingga saat dilintasi kendaraan bermuatan berat, lapisan aspal akan pecah dan terlepas meninggalkan rongga atau ceruk berbahaya.',
    array[
        'Rembesan air hujan yang mengendap akibat sistem drainase jalan yang tidak lancar.',
        'Beban muatan kendaraan (overdimension & overload) yang melampaui kapasitas kelas jalan.',
        'Fluktuasi suhu ekstrem dan kualitas campuran aspal yang mengalami kelelahan struktur (fatigue).',
        'Penurunan tanah dasar (subgrade) pada area rawa atau persawahan pasca banjir.'
    ],
    array[
        'Risiko kecelakaan fatal bagi pengendara sepeda motor, terutama saat genangan air menutupi lubang.',
        'Kerusakan komponen kendaraan seperti ban pecah, velg penyok, dan patah as roda.',
        'Perlambatan laju kendaraan mendadak yang memicu tabrakan beruntun dan kemacetan jalan arteri.'
    ],
    array[
        'Jangan mencoba menambal sendiri menggunakan bahan keras seperti bongkahan batu besar atau batang pohon runcing di tengah jalan karena dapat menjadi proyektil bahaya.',
        'Jika kondisi memungkinkan dan aman, berikan penanda visual darurat dari tepi jalan menggunakan traffic cone atau pita reflektif.',
        'Kurangi kecepatan secara bertahap dan hindari pengereman mendadak di area jalan yang rawan berlubang.',
        'Segera dokumentasikan dan laporkan lokasi presisi melalui aplikasi Noto PATI untuk penanganan teknis Dinas PUTR.'
    ],
    array[
        'Mendukung program penertiban muatan lebih pada truk angkutan material.',
        'Menjaga kebersihan saluran samping jalan agar air tidak meluap dan menggenangi badan aspal.',
        'Segera melaporkan retak kecil sebelum berkembang menjadi lubang yang mengikis pondasi jalan.'
    ],
    '[
        {"title": "Spesifikasi Umum Bina Marga Divisi 6 - Perkerasan Aspal", "source": "Kementerian Pekerjaan Umum dan Perumahan Rakyat RI (2020)"},
        {"title": "Pedoman Penanganan Cepat Kerusakan Jalan Kabupaten", "source": "Dinas Pekerjaan Umum dan Penataan Ruang (DPUTR) Kabupaten Pati (2024)"}
    ]'::jsonb,
    '2026-11-01T08:00:00Z',
    true,
    4
),
(
    'drainase-tersumbat-dan-sedimentasi',
    'drainase',
    'Pencegahan Genangan Air: Memahami Masalah Saluran Drainase dan Sedimentasi',
    'Ketahui penyebab pendangkalan selokan, risiko genangan banjir perkotaan, serta batasan gotong royong warga yang aman untuk menjaga kelancaran saluran air.',
    'Sistem drainase perkotaan dan pedesaan di Kabupaten Pati berfungsi vital untuk mengalirkan limpasan air hujan menuju sungai utama seperti Sungai Juwana. Ketika kapasitas saluran mengecil akibat penumpukan lumpur (sedimentasi) dan sampah padat, air tidak dapat mengalir secara gravitasi dan berbalik menggenangi jalan serta pemukiman warga.',
    array[
        'Penumpukan endapan lumpur dan pasir yang terbawa erosi dari hulu atau pekarangan saat hujan deras.',
        'Penyumbatan oleh sampah plastik rumah tangga dan potongan ranting yang dibuang sembarangan.',
        'Pembangunan penutup saluran liar yang permanen tanpa bak kontrol (manhole) pemeliharaan.',
        'Penyempitan penampang saluran akibat okupasi bangunan liar di sempadan drainase.'
    ],
    array[
        'Banjir genangan air di badan jalan yang merusak perkerasan aspal dan melumpuhkan mobilitas.',
        'Munculnya sarang nyamuk Aedes aegypti penyebar DBD dan bau menyengat akibat pembusukan limbah.',
        'Luapan air kotor ke dalam rumah warga yang berpotensi merusak perabotan dan menimbulkan penyakit kulit.'
    ],
    array[
        'Jangan masuk ke dalam gorong-gorong tertutup tanpa perlengkapan keselamatan dan sirkulasi udara yang memadai karena gas beracun (seperti gas metana/H2S).',
        'Gunakan alat bantu seperti penggaruk bertangkai panjang untuk mengangkat sampah di mulut saringan air terbuka.',
        'Hindari membakar sampah di dalam parit karena dapat merusak dinding beton drainase.',
        'Laporkan ke DPUTR/SDA apabila sedimentasi saluran melebihi 50% kapasitas dan membutuhkan alat pengeruk berat.'
    ],
    array[
        'Menyediakan bak kontrol portabel di depan pagar rumah agar saluran mudah dibersihkan secara berkala.',
        'Tidak membuang sampah sisa bangunan, minyak jelantah, atau plastik ke dalam parit.',
        'Menggalakkan kerja bakti lingkungan di tingkat RT/RW menjelang musim penghujan.'
    ],
    '[
        {"title": "Tata Cara Perencanaan Sistem Drainase Perkotaan (SNI 02-2406-1991)", "source": "Badan Standardisasi Nasional"},
        {"title": "Panduan Mitigasi Banjir Lingkungan Permukiman", "source": "BPBD Kabupaten Pati (2025)"}
    ]'::jsonb,
    '2026-11-02T08:00:00Z',
    true,
    4
),
(
    'penerangan-jalan-umum-dan-bahaya-listrik',
    'lampu',
    'Penerangan Jalan Umum (PJU) Mati & Prosedur Keamanan Bahaya Kelistrikan',
    'Pelajari peran penerangan jalan terhadap keselamatan publik malam hari, serta peringatan keras untuk tidak menyentuh instalasi PJU yang rusak.',
    'Penerangan Jalan Umum (PJU) merupakan sarana keselamatan jalan yang dikelola bersama oleh Dishub dan PLN untuk memberikan jarak pandang memadai bagi pengguna jalan di malam hari sekaligus menekan tingkat kriminalitas. Namun, tiang lampu jalan di ruang publik memiliki risiko tinggi terhadap sengatan listrik jika terjadi induksi atau kabel terkelupas, terutama di musim hujan.',
    array[
        'Lampu putus karena masa pakai (lifetime) bohlam LED/merkuri telah habis.',
        'Komponen sensor otomatis (photocell) atau timer kontaktor di boks panel kotor dan rusak.',
        'Kabel jaringan udara tertimpa pohon tumbang atau kabel bawah tanah terkena galian proyek.',
        'Sambungan kabel korosi akibat kelembaban tinggi dan genangan air hujan.'
    ],
    array[
        'Meningkatnya kerawanan kecelakaan lalu lintas akibat pejalan kaki atau jalan berlubang tidak terlihat.',
        'Meningkatnya potensi aksi kejahatan jalanan seperti begal dan pencurian di area yang gelap.',
        'Bahaya sengatan listrik fatal (electrical shock) bagi warga yang menyentuh tiang logam saat basah.'
    ],
    array[
        'DILARANG KERAS menyentuh tiang lampu jalan, membuka boks panel PJU, atau mencoba menyambung kabel sendiri.',
        'Jika melihat kabel PJU putus menjuntai ke jalan atau ada percikan api, jaga jarak minimal 10 meter dan peringatkan warga sekitar.',
        'Jangan mengikatkan hewan ternak atau spanduk menggunakan kawat pada tiang penerangan jalan.',
        'Kirimkan nomor ID tiang (bila ada plat label) dan foto koordinat melalui Noto PATI agar regu Dishub/PLN segera turun.'
    ],
    array[
        'Melakukan pemangkasan dahan pohon yang berdekatan dengan bentangan kabel listrik PJU melalui koordinasi PLN/Dishub.',
        'Menjaga boks gardu panel PJU dari aksi vandalisme atau penimbunan sampah.',
        'Melaporkan kedipan lampu yang tidak stabil sebelum lampu mati total.'
    ],
    '[
        {"title": "Standar Teknis Penerangan Jalan Umum (PJU) Wilayah Perkotaan", "source": "Kementerian Perhubungan RI (Perhub No. 27/2018)"},
        {"title": "Pedoman Keselamatan Ketenagalistrikan Ruang Terbuka Hijau & Jalan", "source": "PT PLN (Persero) UP3 Pati (2024)"}
    ]'::jsonb,
    '2026-11-03T08:00:00Z',
    true,
    3
),
(
    'kerusakan-trotoar-dan-jalur-disabilitas',
    'trotoar',
    'Memahami Hak Pejalan Kaki: Kerusakan Trotoar dan Ubin Pemandu (Guiding Block)',
    'Edukasi seputar pentingnya fasilitas pejalan kaki inklusif, mengenali jenis kerusakan guiding block disabilitas, dan cara menjaga trotoar tetap nyaman.',
    'Trotoar bukan sekadar pelengkap jalan, melainkan hak asasi mobilitas pejalan kaki, lansia, dan kelompok rentan termasuk penyandang disabilitas (difabel). Jalur pedestrian yang ramah menyediakan ubin pemandu (guiding block bermotif garis untuk jalan terus dan titik untuk berhenti). Kerusakan lantai trotoar atau okupasi ilegal dapat merampas rasa aman dan membahayakan keselamatan warga yang berjalan kaki.',
    array[
        'Penyerobotan trotoar oleh kendaraan bermotor roda dua atau parkir mobil yang meremukkan susunan keramik/paving.',
        'Akar pohon peneduh yang tidak terkontrol mengangkat slab beton trotoar.',
        'Pemasangan instalasi kabel utilitas bawah tanah yang penutupannya tidak dikembalikan ke kondisi semula.',
        'Penutupan manhole saluran yang hilang atau amblas di tengah lajur pejalan kaki.'
    ],
    array[
        'Pejalan kaki terpaksa turun ke badan jalan raya sehingga rentan terserempet kendaraan bermotor.',
        'Disorientasi dan risiko cedera berat bagi tunanetra jika guiding block terputus atau mengarah ke lubang.',
        'Pengguna kursi roda tidak dapat melintas karena ketiadaan ramp atau lantai yang tidak rata.'
    ],
    array[
        'Berikan penanda peringatan sementara jika terdapat lubang penutup manhole yang terbuka di trotoar.',
        'Jangan meletakkan material bangunan, pot tanaman pribadi, atau gerobak dagangan di atas ubin kuning bergaris pemandu.',
        'Prioritaskan keselamatan pejalan kaki difabel jika Anda melihat trotoar di depan mereka terputus atau rusak.',
        'Laporkan titik trotoar yang hancur via Noto PATI agar segera dijadwalkan rehabilitasi oleh DPUTR.'
    ],
    array[
        'Menumbuhkan kesadaran kolektif untuk tidak berkendara maupun memarkir kendaraan di atas fasilitas pedestrian.',
        'Memilih jenis pohon peneduh bertipe akar tunggang dalam yang tidak merusak pondasi trotoar.',
        'Mendorong pelaku usaha ruko menyediakan akses ramp landai yang terintegrasi dengan trotoar kota.'
    ],
    '[
        {"title": "Peraturan Menteri PUPR No. 14/PRT/M/2017 tentang Kemudahan Aksesibilitas Gedung dan Lingkungan", "source": "KemenPUPR RI"},
        {"title": "Pedoman Teknis Fasilitas Pejalan Kaki di Kawasan Perkotaan", "source": "Direktorat Bina Marga (2018)"}
    ]'::jsonb,
    '2026-11-04T08:00:00Z',
    true,
    3
),
(
    'retak-struktur-jembatan-dan-gerusan-pilar',
    'jembatan',
    'Mendeteksi Kerusakan Jembatan: Retak Struktur, Oprit Amblas, dan Gerusan Air',
    'Panduan mengenali tanda bahaya struktural jembatan sungai, pembatasan muatan darurat, dan langkah tanggap darurat warga sekitar.',
    'Kabupaten Pati dilintasi oleh Sungai Juwana dan puluhan anak sungai yang vital bagi pertanian serta konektivitas antar-wilayah. Jembatan merupakan simpul infrastruktur paling berbiaya tinggi dan berisiko kritis. Kerusakan jembatan dapat terjadi pada bangunan atas (lantai gelagar, tiang sandaran) maupun bangunan bawah (abutment, pilar, dan pondasi yang tergerus arus sungai). Memahami tanda awal pelemahan struktur dapat mencegah keruntuhan tiba-tiba.',
    array[
        'Gerusan hidrolika (scouring) pada kaki pilar dan abutment akibat debit arus sungai yang meluap kencang saat musim hujan.',
        'Penurunan tanah di sambungan antara jalan aspal dan pangkal jembatan (oprit/expansion joint amblas).',
        'Beban tonase kendaraan berat (dump truck tambang/ekspedisi) yang melebihi batas kekuatan jembatan kelas III.',
        'Korosi parah pada rangka baja atau pelapukan beton akibat usia pakai dan kelembaban lingkungan sungai.'
    ],
    array[
        'Risiko keruntuhan jembatan (bridge failure) yang dapat menelan korban jiwa dan memutus total urat nadi ekonomi desa.',
        'Guncangan hebat saat kendaraan melintas yang berpotensi menyebabkan patah rangka kendaraan.',
        'Terputusnya akses logistik, ambulans, dan mobilitas anak sekolah menuju pusat kecamatan.'
    ],
    array[
        'DILARANG mendekati kolong jembatan atau berdiri di atas pilar jembatan saat arus air sungai meluap tinggi.',
        'Bila dirasakan getaran bergoyang abnormal atau terdengar suara retakan saat dilewati mobil, segera hentikan lalu lintas kendaraan bermuatan berat.',
        'Pasang rambu darurat peringatan muatan maksimal bersama perangkat desa setempat.',
        'Jangan mencoba mengelas atau menopang tiang jembatan sendiri tanpa supervisi tim insinyur struktur jembatan.',
        'Segera laporkan foto retakan, oprit amblas, atau pilar miring ke Noto PATI untuk status inspeksi prioritas tinggi.'
    ],
    array[
        'Menghindari aktivitas penambangan pasir liar di sekitar zona perlindungan 500 meter hulu/hilir pilar jembatan.',
        'Membersihkan sampah batang pohon yang tersangkut di pilar jembatan sebelum menciptakan efek bendung yang menekan struktur.',
        'Mematuhi rambu batas beban tonase maksimal (MST) yang terpasang di mulut jembatan.'
    ],
    '[
        {"title": "Pedoman Pemeriksaan Jembatan (Bridge Management System - BMS)", "source": "Direktorat Jenderal Bina Marga Kementerian PUPR (2022)"},
        {"title": "Pedoman Kesiapsiagaan dan Mitigasi Bencana Jembatan Rawan Gerusan", "source": "Balai Besar Pelaksanaan Jalan Nasional (BBPJN) Jateng-DIY"}
    ]'::jsonb,
    '2026-11-05T08:00:00Z',
    true,
    5
)
on conflict (slug) do update set
    category = excluded.category,
    title = excluded.title,
    summary = excluded.summary,
    content = excluded.content,
    causes = excluded.causes,
    impacts = excluded.impacts,
    safety_actions = excluded.safety_actions,
    prevention_steps = excluded.prevention_steps,
    references = excluded.references,
    reviewed_at = excluded.reviewed_at,
    is_published = excluded.is_published,
    read_time_minutes = excluded.read_time_minutes,
    updated_at = now();

