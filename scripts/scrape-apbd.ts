import { scrapeDjpkApbd } from "../src/features/apbd/scraper";
import { DJPK_CONSTANTS, MONTH_NAMES } from "../src/features/apbd/scraper/constants";
import { saveApbdRawResult } from "../src/features/apbd/storage";
import type { ApbdScraperParams } from "../src/features/apbd/types";

function parseArgs(args: string[]): { params: ApbdScraperParams; outputDir?: string } {
  let tahun: number = DJPK_CONSTANTS.DEFAULT_TAHUN;
  let periode: number = DJPK_CONSTANTS.DEFAULT_PERIODE;
  let provinsi: string = DJPK_CONSTANTS.DEFAULT_PROVINSI;
  let pemda: string = DJPK_CONSTANTS.DEFAULT_PEMDA;
  let outputDir: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--tahun" && args[i + 1]) {
      tahun = parseInt(args[++i], 10);
    } else if (arg === "--periode" && args[i + 1]) {
      periode = parseInt(args[++i], 10);
    } else if (arg === "--provinsi" && args[i + 1]) {
      provinsi = args[++i];
    } else if (arg === "--pemda" && args[i + 1]) {
      pemda = args[++i];
    } else if (arg === "--output" && args[i + 1]) {
      outputDir = args[++i];
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
  }

  if (Number.isNaN(tahun) || tahun < 2000 || tahun > 2100) {
    console.error(`Error: Parameter --tahun tidak valid (${tahun}).`);
    process.exit(1);
  }

  if (Number.isNaN(periode) || periode < 1 || periode > 12) {
    console.error(`Error: Parameter --periode harus antara 1-12 (bulan). Didapatkan: ${periode}.`);
    process.exit(1);
  }

  return {
    params: { tahun, periode, provinsi, pemda },
    outputDir,
  };
}

function printUsage() {
  console.log(`
Usage:
  npm run scrape:apbd [-- --tahun <year>] [--periode <month>] [--provinsi <code>] [--pemda <code>]

Options:
  --tahun     Tahun anggaran (default: 2026)
  --periode   Bulan pelaporan 1-12 (default: 1 [Januari])
  --provinsi  Kode provinsi DJPK (default: 11 [Jawa Tengah])
  --pemda     Kode pemda DJPK (default: 17 [Kabupaten Pati])
  --output    Custom output directory (default: data/raw/apbd)
  --help, -h  Tampilkan panduan ini
`);
}

async function main() {
  const { params, outputDir } = parseArgs(process.argv.slice(2));

  console.log("=================================================");
  console.log("Noto PATI - Scraper Data APBD DJPK Kemenkeu");
  console.log("=================================================");
  console.log(`Tahun Anggaran : ${params.tahun}`);
  console.log(`Periode / Bulan: ${params.periode} (${MONTH_NAMES[params.periode] ?? "Unknown"})`);
  console.log(`Wilayah        : Provinsi ${params.provinsi}, Pemda ${params.pemda}`);
  console.log("-------------------------------------------------");
  console.log("Mengambil data dari portal resmi DJPK...");

  const startTime = Date.now();

  try {
    const result = await scrapeDjpkApbd(params);
    const duration = Date.now() - startTime;

    console.log(`✓ Berhasil mengambil data (${duration}ms)`);
    console.log(`✓ Jumlah baris akun: ${result.rows.length}`);
    if (result.metadata.keteranganPortal) {
      console.log(`✓ Info Sumber: ${result.metadata.keteranganPortal}`);
    }

    if (result.summary.totalPendapatanAnggaran !== undefined) {
      const formatIdr = (val: number) => "Rp " + val.toLocaleString("id-ID");
      console.log("-------------------------------------------------");
      console.log("Ringkasan APBD:");
      console.log(`  Pendapatan Daerah: ${formatIdr(result.summary.totalPendapatanAnggaran)} (Realisasi: ${formatIdr(result.summary.totalPendapatanRealisasi ?? 0)})`);
      console.log(`  Belanja Daerah   : ${formatIdr(result.summary.totalBelanjaAnggaran ?? 0)} (Realisasi: ${formatIdr(result.summary.totalBelanjaRealisasi ?? 0)})`);
      console.log(`  Pembiayaan Daerah: ${formatIdr(result.summary.totalPembiayaanAnggaran ?? 0)} (Realisasi: ${formatIdr(result.summary.totalPembiayaanRealisasi ?? 0)})`);
    }

    const { filePath, fileName } = await saveApbdRawResult(result, { outputDir });
    console.log("-------------------------------------------------");
    console.log(`✓ Data berhasil disimpan ke: ${filePath}`);
    console.log(`  (${fileName})`);
    console.log("=================================================");
  } catch (error: unknown) {
    const err = error as Error;
    console.error("-------------------------------------------------");
    console.error(`✗ Gagal mengambil data APBD: ${err.message}`);
    if ("status" in err && (err as { status?: number }).status) {
      console.error(`  HTTP Status: ${(err as { status?: number }).status}`);
    }
    console.error("=================================================");
    process.exit(1);
  }
}

main();
