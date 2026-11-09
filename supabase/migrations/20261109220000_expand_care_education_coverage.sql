-- Add public guidance for report categories that were not yet represented
-- in the education catalog: river embankments, road signs, and general facility damage.
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
    "references",
    reviewed_at,
    is_published,
    read_time_minutes
) values
(
    'retakan-dan-rembesan-tanggul-sungai',
    'tanggul',
    'Mengenali Retakan dan Rembesan pada Tanggul Sungai',
    'Kenali perubahan pada tanggul seperti retakan baru, rembesan yang membawa tanah, atau erosi. Utamakan jarak aman dan laporkan lokasinya.',
    'Tanggul membantu membatasi aliran air agar tidak meluas ke area di sekitarnya. Perubahan seperti retakan memanjang, bagian yang turun, tanah tergerus, atau rembesan yang tampak membawa butiran tanah perlu diperhatikan. Warga tidak perlu memastikan penyebab atau tingkat kerusakan sendiri; dokumentasikan tanda yang terlihat dari tempat aman dan minta pemeriksaan petugas.',
    array[
        'Aliran air dan hujan dapat mengikis permukaan atau kaki tanggul.',
        'Tanah dasar yang bergerak atau turun dapat memunculkan retakan dan perubahan bentuk.',
        'Saluran air di sekitar tanggul yang tersumbat dapat menimbulkan genangan atau aliran yang tidak terkendali.',
        'Penggalian atau beban tambahan di dekat tanggul dapat mengganggu kondisinya.'
    ],
    array[
        'Retakan atau rembesan yang berkembang dapat melemahkan bagian tanggul.',
        'Kerusakan yang tidak ditangani dapat meningkatkan risiko air meluap ke area sekitar.',
        'Genangan atau banjir dapat mengganggu akses warga dan merusak barang di lingkungan terdampak.'
    ],
    array[
        'Jangan mendekati retakan, rembesan, atau tepi tanggul yang tergerus.',
        'Jangan menggali, menutup rembesan, atau menambal tanggul sendiri.',
        'Catat lokasi dan laporkan dari tempat yang kering serta aman.',
        'Jika air naik atau ada arahan evakuasi, ikuti petugas setempat dan jauhi area banjir.'
    ],
    array[
        'Laporkan perubahan bentuk atau rembesan sejak pertama terlihat.',
        'Hindari penggalian dan penumpukan material pada tubuh tanggul.',
        'Jaga saluran lingkungan tetap bersih jika dapat dilakukan tanpa mendekati area berbahaya.'
    ],
    '[
        {"title": "Undang-Undang Republik Indonesia Nomor 17 Tahun 2019 tentang Sumber Daya Air", "source": "Pemerintah Republik Indonesia"},
        {"title": "Peraturan Menteri Pekerjaan Umum Nomor 12/PRT/M/2015 tentang Eksploitasi dan Pemeliharaan Sumber Air dan Bangunan Pengairan", "source": "Kementerian Pekerjaan Umum dan Perumahan Rakyat"}
    ]'::jsonb,
    '2026-11-09T08:00:00Z',
    true,
    3
),
(
    'rambu-dan-marka-jalan-rusak',
    'rambu',
    'Rambu Hilang, Rusak, atau Marka Jalan Memudar',
    'Pelajari cara menyikapi rambu yang hilang, tertutup, atau rusak serta marka yang memudar tanpa menambah risiko di jalan.',
    'Rambu dan marka membantu pengguna jalan mengenali peringatan, larangan, petunjuk, serta batas ruang jalan. Rambu yang roboh, tertutup, atau sulit dibaca dan marka yang memudar dapat membuat informasi jalan tidak terlihat dengan jelas. Warga dapat melaporkan kondisinya, tetapi pemasangan, pemindahan, dan perbaikannya perlu dilakukan oleh petugas berwenang.',
    array[
        'Benturan kendaraan atau cuaca dapat merusak dan menjatuhkan rambu.',
        'Dahan, spanduk, atau benda lain dapat menutupi rambu dari arah pandang pengguna jalan.',
        'Marka dapat memudar akibat cuaca dan lalu lintas yang terus melintas.',
        'Pekerjaan jalan dapat mengubah kondisi rambu atau marka sementara.'
    ],
    array[
        'Pengguna jalan dapat terlambat melihat peringatan atau petunjuk arah.',
        'Batas lajur dan area penyeberangan yang tidak terlihat dapat membingungkan pengguna jalan.',
        'Rambu yang roboh atau pecah dapat menjadi hambatan fisik di sekitar jalan.'
    ],
    array[
        'Jangan memindahkan, memasang, atau memperbaiki rambu sendiri.',
        'Jangan berhenti di lajur atau menyeberang untuk mengambil foto.',
        'Laporkan jenis kerusakan, arah jalan, dan patokan lokasi.',
        'Jika rambu roboh membahayakan lalu lintas, jauhi badan jalan dan beri tahu petugas setempat.'
    ],
    array[
        'Laporkan rambu yang tertutup atau mulai sulit dibaca.',
        'Jangan menempelkan pengumuman atau benda lain pada rambu.',
        'Sertakan foto hanya jika dapat diambil dari area yang aman.'
    ],
    '[
        {"title": "Peraturan Menteri Perhubungan Nomor PM 13 Tahun 2014 tentang Rambu Lalu Lintas", "source": "Kementerian Perhubungan Republik Indonesia"},
        {"title": "Peraturan Menteri Perhubungan Nomor PM 34 Tahun 2014 tentang Marka Jalan", "source": "Kementerian Perhubungan Republik Indonesia"}
    ]'::jsonb,
    '2026-11-09T08:00:00Z',
    true,
    3
),
(
    'vandalisme-fasilitas-publik',
    'lainnya',
    'Vandalisme pada Fasilitas Publik: Utamakan Aman, Lalu Laporkan',
    'Coretan, komponen yang dirusak, atau bagian fasilitas yang hilang dapat mengurangi fungsi ruang publik. Kenali langkah aman untuk melaporkannya.',
    'Vandalisme pada halte, taman, bangku, papan informasi, tempat sampah, atau fasilitas umum lainnya dapat berupa coretan, pecahan, bagian yang dibongkar, maupun komponen yang hilang. Selain mengganggu fungsi fasilitas, kerusakan dapat menyisakan tepi tajam, bagian yang tidak stabil, atau instalasi yang terbuka. Jangan menyimpulkan siapa pelakunya; fokus pada kondisi fasilitas dan laporkan agar pengelola dapat memeriksanya.',
    array[
        'Fasilitas dapat dirusak atau dicoret dengan sengaja.',
        'Benturan, usia pakai, dan kurangnya pemeliharaan juga dapat menimbulkan kerusakan yang tampak serupa.',
        'Komponen yang longgar atau hilang dapat membuat fasilitas tidak aman digunakan.'
    ],
    array[
        'Fasilitas tidak dapat digunakan sebagaimana mestinya oleh warga.',
        'Pecahan, tepi tajam, atau bagian yang tidak stabil dapat mencederai pengguna.',
        'Kabel atau komponen yang terbuka dapat menimbulkan bahaya tambahan.'
    ],
    array[
        'Jangan menegur orang yang diduga merusak fasilitas.',
        'Jangan menyentuh bagian tajam, kabel, atau bahan yang tidak dikenal.',
        'Jauhi area rusak dan beri tahu warga lain tanpa menghalangi jalan.',
        'Laporkan jenis fasilitas, lokasi, dan kondisi kerusakan melalui Noto PATI.'
    ],
    array[
        'Gunakan fasilitas sesuai peruntukannya dan jaga kebersihan area.',
        'Laporkan kerusakan sejak awal sebelum bagian lain ikut terdampak.',
        'Hindari membersihkan cat, cairan, atau bahan yang tidak dikenal sendiri.'
    ],
    '[
        {"title": "Peraturan Menteri Dalam Negeri Nomor 19 Tahun 2016 tentang Pedoman Pengelolaan Barang Milik Daerah", "source": "Kementerian Dalam Negeri Republik Indonesia"},
        {"title": "Peraturan Menteri Pekerjaan Umum Nomor 24/PRT/M/2008 tentang Pedoman Pemeliharaan dan Perawatan Bangunan Gedung", "source": "Kementerian Pekerjaan Umum"}
    ]'::jsonb,
    '2026-11-09T08:00:00Z',
    true,
    3
),
(
    'panduan-umum-fasilitas-publik',
    'lainnya',
    'Panduan Umum Menghadapi Kerusakan Fasilitas Publik',
    'Jaga jarak dari kerusakan, catat kondisi yang terlihat dari tempat aman, dan laporkan fasilitas yang perlu diperiksa petugas.',
    'Gunakan panduan ini untuk kerusakan fasilitas publik yang belum memiliki kategori khusus, termasuk kerusakan yang diduga akibat vandalisme. Kondisi yang tampak bisa beragam, seperti bagian yang lepas, retak, tidak berfungsi, atau membahayakan pengguna. Warga tidak perlu menentukan penyebab atau memperbaikinya sendiri. Utamakan keselamatan, lalu sampaikan jenis fasilitas, lokasi, dan kondisi yang terlihat agar petugas atau pengelola dapat memeriksanya.',
    array[
        'Kerusakan dapat terjadi karena usia pakai, cuaca, benturan, pemeliharaan, atau tindakan manusia.',
        'Bagian fasilitas yang longgar, patah, atau tidak berfungsi bisa menimbulkan risiko bagi pengguna.',
        'Penyebab kerusakan sering kali tidak dapat dipastikan hanya dari pengamatan warga.'
    ],
    array[
        'Fasilitas mungkin tidak dapat digunakan sebagaimana mestinya.',
        'Bagian tajam, tidak stabil, atau instalasi terbuka dapat mencederai warga.',
        'Kerusakan yang tidak dilaporkan dapat terus mengganggu akses atau keselamatan pengguna.'
    ],
    array[
        'Jauhi area dan bagian fasilitas yang tampak rusak atau tidak stabil.',
        'Jangan menyentuh atau mencoba memperbaiki bagian yang rusak. Hindari bahan yang tidak dikenal.',
        'Jangan berkonfrontasi jika ada dugaan vandalisme; laporkan kondisi fasilitas saja.',
        'Catat jenis fasilitas, patokan lokasi, dan kondisi yang terlihat dari tempat aman.',
        'Laporkan melalui Noto PATI dan ikuti arahan petugas jika area dinyatakan berbahaya.'
    ],
    array[
        'Gunakan fasilitas sesuai peruntukannya dan ikuti petunjuk pengelola.',
        'Laporkan kerusakan saat pertama terlihat agar dapat diperiksa lebih lanjut.',
        'Ambil foto hanya jika dapat dilakukan tanpa mendekati bahaya atau mengganggu pengguna lain.'
    ],
    '[
        {"title": "Peraturan Menteri Dalam Negeri Nomor 19 Tahun 2016 tentang Pedoman Pengelolaan Barang Milik Daerah", "source": "Kementerian Dalam Negeri Republik Indonesia"},
        {"title": "Peraturan Menteri Pekerjaan Umum Nomor 24/PRT/M/2008 tentang Pedoman Pemeliharaan dan Perawatan Bangunan Gedung", "source": "Kementerian Pekerjaan Umum"}
    ]'::jsonb,
    '2026-11-09T08:00:00Z',
    true,
    3
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
    "references" = excluded."references",
    reviewed_at = excluded.reviewed_at,
    is_published = excluded.is_published,
    read_time_minutes = excluded.read_time_minutes,
    updated_at = now();
