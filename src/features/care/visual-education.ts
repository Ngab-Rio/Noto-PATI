import { createElement, type ComponentType, type SVGProps } from "react";
import { Landmark, Signpost, Waves } from "lucide-react";
import type { ReportCategory } from "./types";
import { RoadIllustration } from "./components/illustrations/RoadIllustration";
import { DrainageIllustration } from "./components/illustrations/DrainageIllustration";
import { StreetLightIllustration } from "./components/illustrations/StreetLightIllustration";
import { SidewalkIllustration } from "./components/illustrations/SidewalkIllustration";
import { BridgeIllustration } from "./components/illustrations/BridgeIllustration";

export interface VisualActionItem {
  iconType: "avoid" | "flag" | "report" | "clean" | "check";
  text: string; // Maksimal 8 kata
}

export interface VisualEducationData {
  category: ReportCategory;
  categoryLabel: string;
  title: string; // Maksimal 6 kata
  summary: string; // Maksimal 2 kalimat
  impact: string; // Maksimal 1 kalimat
  safeActions: VisualActionItem[]; // Maksimal 3 item
  prevention: VisualActionItem[]; // Maksimal 3 item
  fullArticleSlug: string;
  Illustration: ComponentType<SVGProps<SVGSVGElement>>;
  illustrationAlt: string;
  visualKind?: "icon";
}

const WavesSymbol: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  createElement(Waves, props)
);
const SignpostSymbol: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  createElement(Signpost, props)
);
const LandmarkSymbol: ComponentType<SVGProps<SVGSVGElement>> = (props) => (
  createElement(Landmark, props)
);

export const VISUAL_EDUCATION_REGISTRY: Record<string, VisualEducationData> = {
  jalan: {
    category: "jalan",
    categoryLabel: "Jalan & Aspal",
    title: "Kenali Bahaya Lubang Jalan",
    summary:
      "Rembesan air hujan dan kendaraan overtonase mengikis pondasi aspal. Kenali tanda lubang tersembunyi demi keselamatan.",
    impact: "Memicu kecelakaan fatal bagi pengendara motor terutama saat jalanan tergenang air.",
    safeActions: [
      { iconType: "avoid", text: "Kurangi laju kendaraan dan jaga jarak aman." },
      { iconType: "flag", text: "Beri penanda visual aman dari tepi jalan." },
      { iconType: "avoid", text: "Jangan menambal dengan batu tajam atau bambu." },
    ],
    prevention: [
      { iconType: "clean", text: "Jaga saluran samping jalan dari sampah." },
      { iconType: "report", text: "Laporkan retak dini sebelum menjadi lubang dalam." },
      { iconType: "check", text: "Dukung penertiban muatan truk logistik berat." },
    ],
    fullArticleSlug: "jalan-berlubang-dan-amblas",
    Illustration: RoadIllustration,
    illustrationAlt: "Ilustrasi penampang lubang jalan aspal dan penanda kerucut darurat",
  },
  drainase: {
    category: "drainase",
    categoryLabel: "Drainase & Saluran Air",
    title: "Cegah Banjir dan Genangan Air",
    summary:
      "Endapan lumpur dan sampah padat menyumbat daya tampung saluran. Aliran air tersumbat dapat meluap ke permukiman warga.",
    impact: "Mempercepat kerusakan aspal jalan dan memicu bibit penyakit demam berdarah.",
    safeActions: [
      { iconType: "avoid", text: "Dilarang masuk gorong-gorong tertutup rawan racun." },
      { iconType: "clean", text: "Bersihkan saringan terbuka menggunakan alat penggaruk." },
      { iconType: "report", text: "Laporkan endapan lumpur tebal melebihi separuh parit." },
    ],
    prevention: [
      { iconType: "clean", text: "Tidak membuang plastik atau limbah ke selokan." },
      { iconType: "check", text: "Buat bak kontrol portabel di depan pagar." },
      { iconType: "clean", text: "Galakkan kerja bakti lingkungan menjelang musim hujan." },
    ],
    fullArticleSlug: "drainase-tersumbat-dan-sedimentasi",
    Illustration: DrainageIllustration,
    illustrationAlt: "Ilustrasi saluran beton drainase tersumbat sedimentasi dan aliran air",
  },
  lampu: {
    category: "lampu",
    categoryLabel: "Penerangan Jalan (PJU)",
    title: "Waspada Tiang PJU dan Listrik",
    summary:
      "Penerangan padam menciptakan titik buta jalan malam hari. Tiang logam basah berisiko bahaya kebocoran arus listrik.",
    impact: "Meningkatkan risiko kecelakaan malam dan bahaya sengatan listrik fatal.",
    safeActions: [
      { iconType: "avoid", text: "DILARANG menyentuh tiang atau membuka gardu boks." },
      { iconType: "avoid", text: "Jaga jarak 10 meter jika kabel menjuntai." },
      { iconType: "report", text: "Catat nomor plat tiang untuk teknisi Dishub." },
    ],
    prevention: [
      { iconType: "check", text: "Pangkas ranting pohon dekat jaringan kabel listrik." },
      { iconType: "avoid", text: "Hindari memasang spanduk kawat pada tiang PJU." },
      { iconType: "report", text: "Laporkan kedipan lampu sebelum padam total." },
    ],
    fullArticleSlug: "penerangan-jalan-umum-dan-bahaya-listrik",
    Illustration: StreetLightIllustration,
    illustrationAlt: "Ilustrasi tiang lampu jalan padam di malam hari dan peringatan bahaya listrik",
  },
  trotoar: {
    category: "trotoar",
    categoryLabel: "Trotoar & Pedestrian",
    title: "Lindungi Hak Pejalan Kaki",
    summary:
      "Trotoar dan ubin pemandu (guiding block) difabel menjamin mobilitas aman. Lantai pecah atau amblas membahayakan pejalan.",
    impact: "Memaksa warga berjalan di badan jalan raya dan berisiko terserempet.",
    safeActions: [
      { iconType: "flag", text: "Beri tanda peringatan bila penutup manhole terbuka." },
      { iconType: "avoid", text: "Jangan halangi jalur ubin kuning penyandang disabilitas." },
      { iconType: "report", text: "Laporkan ubin guiding block rusak demi difabel." },
    ],
    prevention: [
      { iconType: "avoid", text: "Tidak memarkir motor atau mobil di atas trotoar." },
      { iconType: "check", text: "Pilih pohon peneduh berakar dalam tidak merusak." },
      { iconType: "check", text: "Sediakan akses ramp ramah kursi roda." },
    ],
    fullArticleSlug: "kerusakan-trotoar-dan-jalur-disabilitas",
    Illustration: SidewalkIllustration,
    illustrationAlt: "Ilustrasi jalur pedestrian dengan ubin pemandu difabel dan paving retak",
  },
  jembatan: {
    category: "jembatan",
    categoryLabel: "Jembatan & Penyeberangan",
    title: "Jaga Integritas Struktur Jembatan",
    summary:
      "Arus deras sungai menggerus pilar dan oprit penghubung jembatan. Retakan struktur memerlukan perhatian inspeksi segera.",
    impact: "Kerusakan kritis berisiko memutus jalur ekonomi antar-wilayah kecamatan Pati.",
    safeActions: [
      { iconType: "avoid", text: "Dilarang berada di kolong pilar saat banjir." },
      { iconType: "avoid", text: "Hentikan truk muatan berat bila jembatan bergoyang." },
      { iconType: "report", text: "Foto retakan oprit dan laporkan segera via aplikasi." },
    ],
    prevention: [
      { iconType: "avoid", text: "Hentikan tambang pasir liar dekat kaki pilar." },
      { iconType: "clean", text: "Bersihkan tumpukan batang pohon penyumbat tiang." },
      { iconType: "check", text: "Patuhi batas muatan tonase maksimal yang terpasang." },
    ],
    fullArticleSlug: "retak-struktur-jembatan-dan-gerusan-pilar",
    Illustration: BridgeIllustration,
    illustrationAlt: "Ilustrasi pilar jembatan sungai tergerus arus air dan tanda batas muatan",
  },
  tanggul: {
    category: "tanggul",
    categoryLabel: "Tanggul & Pengendali Banjir",
    title: "Waspadai Retakan dan Rembesan Tanggul",
    summary:
      "Retakan baru, rembesan yang membawa tanah, atau erosi pada tanggul perlu dilaporkan dari lokasi yang aman.",
    impact: "Kerusakan yang berkembang dapat mengurangi perlindungan area di sekitar tanggul.",
    safeActions: [
      { iconType: "avoid", text: "Jangan mendekati retakan atau aliran air." },
      { iconType: "avoid", text: "Jangan menutup rembesan atau menggali tanggul." },
      { iconType: "report", text: "Laporkan lokasi dari tempat yang aman." },
    ],
    prevention: [
      { iconType: "report", text: "Laporkan perubahan kecil sejak awal." },
      { iconType: "avoid", text: "Hindari penggalian di tubuh tanggul." },
      { iconType: "check", text: "Ikuti arahan evakuasi petugas setempat." },
    ],
    fullArticleSlug: "retakan-dan-rembesan-tanggul-sungai",
    Illustration: WavesSymbol,
    illustrationAlt: "Ikon gelombang air untuk panduan keselamatan tanggul sungai",
    visualKind: "icon",
  },
  rambu: {
    category: "rambu",
    categoryLabel: "Rambu & Marka Jalan",
    title: "Kenali Rambu dan Marka Rusak",
    summary:
      "Rambu hilang, tertutup, atau rusak serta marka yang memudar dapat membuat petunjuk jalan sulit dikenali.",
    impact: "Pengguna jalan dapat terlambat melihat peringatan atau batas lajur.",
    safeActions: [
      { iconType: "avoid", text: "Jangan memperbaiki atau memindahkan rambu." },
      { iconType: "avoid", text: "Jangan berhenti di lajur untuk memotret." },
      { iconType: "report", text: "Laporkan lokasi dan arah jalan." },
    ],
    prevention: [
      { iconType: "report", text: "Laporkan rambu tertutup sebelum tertabrak." },
      { iconType: "check", text: "Sertakan patokan lokasi yang mudah dikenali." },
      { iconType: "avoid", text: "Jangan menempelkan pengumuman pada rambu." },
    ],
    fullArticleSlug: "rambu-dan-marka-jalan-rusak",
    Illustration: SignpostSymbol,
    illustrationAlt: "Ikon penunjuk jalan untuk panduan rambu dan marka rusak",
    visualKind: "icon",
  },
  lainnya: {
    category: "lainnya",
    categoryLabel: "Fasilitas Publik Lainnya",
    title: "Kenali Kerusakan Fasilitas Publik",
    summary:
      "Kerusakan fasilitas dapat mengganggu fungsi dan keselamatan warga. Jaga jarak, catat kondisi yang terlihat, lalu laporkan.",
    impact: "Bagian tidak stabil, tajam, atau beraliran listrik dapat membahayakan warga.",
    safeActions: [
      { iconType: "avoid", text: "Jauhi area rusak dan jangan menyentuhnya." },
      { iconType: "avoid", text: "Jangan mencoba memperbaiki atau membersihkan bagian yang rusak." },
      { iconType: "report", text: "Laporkan jenis fasilitas, lokasi, dan kondisi dari tempat aman." },
    ],
    prevention: [
      { iconType: "report", text: "Sertakan kondisi yang terlihat dan patokan." },
      { iconType: "check", text: "Ikuti arahan petugas atau pengelola." },
      { iconType: "avoid", text: "Jangan membersihkan bahan tidak dikenal." },
    ],
    fullArticleSlug: "panduan-umum-fasilitas-publik",
    Illustration: LandmarkSymbol,
    illustrationAlt: "Ikon bangunan untuk panduan umum keselamatan fasilitas publik",
    visualKind: "icon",
  },
};

/**
 * Mengambil data edukasi visual berdasarkan kategori.
 * Kategori laporan yang belum memiliki ilustrasi khusus menggunakan ikon tematik.
 */
export function getVisualEducationForCategory(category: string): VisualEducationData | null {
  const normalizedKey = category.toLowerCase().trim();
  if (normalizedKey in VISUAL_EDUCATION_REGISTRY) {
    return VISUAL_EDUCATION_REGISTRY[normalizedKey];
  }
  if (normalizedKey === "penerangan") return VISUAL_EDUCATION_REGISTRY.lampu;

  // Fallback umum aman
  return VISUAL_EDUCATION_REGISTRY.jalan ?? null;
}

/**
 * Event telemetry sederhana untuk mencatat dampak edukasi tanpa menyimpan PII.
 */
export type CareTrackingEvent = "card_viewed" | "click_learn_more" | "click_view_report";

export function trackCareEvent(event: CareTrackingEvent, category: string, reportId?: string) {
  try {
    const payload = {
      event,
      category,
      reportId: reportId ?? null,
      timestamp: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
      const existing = JSON.parse(window.localStorage.getItem("notopati_care_events") || "[]");
      existing.push(payload);
      // Batasi simpan 20 event terakhir di browser
      window.localStorage.setItem("notopati_care_events", JSON.stringify(existing.slice(-20)));
    }
  } catch {
    // Silent catch agar tidak mengganggu UI pengguna
  }
}
