import { 
  Lightbulb, 
  Camera, 
  MapPin, 
  FileText, 
  CheckCircle,
  AlertTriangle 
} from "lucide-react";

const TIPS_DATA = [
  {
    icon: Camera,
    title: "Tips Foto Berkualitas",
    items: [
      "Ambil foto pada siang hari dengan pencahayaan cukup",
      "Foto dari berbagai sudut untuk menunjukkan kerusakan",
      "Sertakan patokan lokasi (nama jalan, bangunan)",
      "Hindari menyertakan wajah atau plat nomor kendaraan",
    ],
  },
  {
    icon: MapPin,
    title: "Tips Menentukan Lokasi",
    items: [
      "Sebutkan nama kecamatan dan desa/kelurahan dengan jelas",
      "Cantumkan nama jalan dan nomor kilometer jika ada",
      "Sertakan patokan bangunan atau tempat terkenal terdekat",
      "Jelaskan posisi relatif terhadap landmark yang dikenal",
    ],
  },
  {
    icon: FileText,
    title: "Tips Deskripsi Efektif",
    items: [
      "Jelaskan kondisi kerusakan secara spesifik",
      "Sebutkan sejak kapan kerusakan terjadi",
      "Jelaskan dampak bagi warga atau pengguna jalan",
      "Gunakan bahasa yang objektif dan faktual",
    ],
  },
];

const DO_DONTS = {
  do: [
    "Lampirkan foto yang jelas dan relevan",
    "Berikan deskripsi lengkap dan faktual",
    "Pastikan alamat lokasi lengkap dan detail",
    "Pilih kategori yang sesuai dengan kondisi",
  ],
  dont: [
    "Jangan upload foto yang mengandung SARA",
    "Jangan menggunakan bahasa kasar atau emosional",
    "Jangan membuat laporan palsu atau hoaks",
    "Jangan sertakan informasi pribadi orang lain",
  ],
};

export function TipsCard() {
  return (
    <div className="space-y-4">
      {/* Main Tips Card */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm sticky top-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-accent-soft flex items-center justify-center">
            <Lightbulb className="h-5 w-5 text-accent" />
          </div>
          <h3 className="font-bold text-text">Tips Melapor yang Baik</h3>
        </div>

        <div className="space-y-6">
          {TIPS_DATA.map((section, index) => {
            const Icon = section.icon;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <h4 className="text-sm font-semibold text-text">{section.title}</h4>
                </div>
                <ul className="space-y-1.5 pl-6">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-xs text-text-muted leading-relaxed">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-border" />

        {/* Do's and Don'ts */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-text">Yang Boleh & Tidak Boleh</h4>
          
          {/* Do's */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">BOLEH</span>
            </div>
            <ul className="space-y-1 pl-5">
              {DO_DONTS.do.map((item, index) => (
                <li key={index} className="text-xs text-text-muted leading-relaxed">
                  ✓ {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Don'ts */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="text-xs font-semibold">JANGAN</span>
            </div>
            <ul className="space-y-1 pl-5">
              {DO_DONTS.dont.map((item, index) => (
                <li key={index} className="text-xs text-text-muted leading-relaxed">
                  ✗ {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3">
          <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
            <strong>💡 Ingat:</strong> Laporan yang lengkap dan jelas akan mempercepat proses
            verifikasi dan tindak lanjut oleh dinas terkait.
          </p>
        </div>
      </div>

      {/* Help Card */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <h4 className="text-sm font-semibold text-text mb-2">Butuh Bantuan?</h4>
        <p className="text-xs text-text-muted mb-3 leading-relaxed">
          Jika Anda mengalami kesulitan atau memiliki pertanyaan, silakan hubungi tim support kami.
        </p>
        <a
          href="#"
          className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
        >
          Lihat Panduan Lengkap
          <span>→</span>
        </a>
      </div>
    </div>
  );
}
