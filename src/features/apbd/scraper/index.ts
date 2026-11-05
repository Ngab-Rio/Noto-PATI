import { createHash } from "node:crypto";
import type { ApbdExtractionResult, ApbdMetadata, ApbdRawRow, ApbdScraperParams } from "../types";
import { DJPK_CONSTANTS, MONTH_NAMES } from "./constants";
import { extractPortalKeterangan, parseDjpkXmlSpreadsheet } from "./parser";

export class ApbdFetchError extends Error {
  readonly status?: number;
  readonly url?: string;
  constructor(message: string, status?: number, url?: string) {
    super(message);
    this.name = "ApbdFetchError";
    this.status = status;
    this.url = url;
  }
}

export interface FetchOptions {
  timeoutMs?: number;
  fetchPortalHtml?: boolean;
}

/**
 * Custom fetch wrapper with retry support for slow public government portals.
 */
async function fetchWithRetry(
  url: string,
  options: { timeoutMs: number; headers?: Record<string, string> },
  maxRetries = 2
): Promise<Response> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: options.headers,
      });
      clearTimeout(timer);
      return response;
    } catch (err: unknown) {
      clearTimeout(timer);
      lastError = err as Error;
      if (attempt <= maxRetries) {
        // Wait 2s before retry
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${url}`);
}

/**
 * Builds the official DJPK portal view URL.
 */
export function buildPortalUrl(params: ApbdScraperParams): string {
  const url = new URL(DJPK_CONSTANTS.PORTAL_BASE_URL);
  url.searchParams.set("periode", String(params.periode));
  url.searchParams.set("tahun", String(params.tahun));
  url.searchParams.set("provinsi", String(params.provinsi));
  url.searchParams.set("pemda", String(params.pemda));
  return url.toString();
}

/**
 * Builds the official DJPK CSV/Excel download URL.
 */
export function buildDownloadUrl(params: ApbdScraperParams): string {
  const url = new URL(DJPK_CONSTANTS.DOWNLOAD_CSV_URL);
  url.searchParams.set("type", "apbd");
  url.searchParams.set("periode", String(params.periode));
  url.searchParams.set("tahun", String(params.tahun));
  url.searchParams.set("provinsi", String(params.provinsi));
  url.searchParams.set("pemda", String(params.pemda));
  return url.toString();
}

/**
 * Core scraping engine for DJPK APBD data.
 */
export async function scrapeDjpkApbd(
  params: ApbdScraperParams,
  options: FetchOptions = {}
): Promise<ApbdExtractionResult> {
  const timeoutMs = options.timeoutMs ?? 60000; // 60s timeout for slow gov servers
  const portalUrl = buildPortalUrl(params);
  const downloadUrl = buildDownloadUrl(params);

  // 1. Fetch official spreadsheet with retry
  let response: Response;
  let rawContent: string;
  try {
    response = await fetchWithRetry(downloadUrl, {
      timeoutMs,
      headers: {
        "User-Agent": DJPK_CONSTANTS.USER_AGENT,
        Accept: "application/vnd.ms-excel, text/xml, */*",
      },
    });
    rawContent = await response.text();
  } catch (err: unknown) {
    const error = err as Error;
    if (error.name === "AbortError") {
      throw new ApbdFetchError(`Request timed out setelah ${timeoutMs}ms ke ${downloadUrl}`, 408, downloadUrl);
    }
    throw new ApbdFetchError(`Gagal menghubungi endpoint DJPK: ${error.message}`, undefined, downloadUrl);
  }

  if (!response.ok) {
    throw new ApbdFetchError(`DJPK server returned HTTP ${response.status}: ${response.statusText}`, response.status, downloadUrl);
  }

  if (!rawContent || rawContent.trim().length === 0) {
    throw new ApbdFetchError("Konten yang diterima dari server DJPK kosong", response.status, downloadUrl);
  }

  // 2. Optional: Fetch portal HTML to grab additional description/keterangan
  let keteranganPortal: string | undefined;
  if (options.fetchPortalHtml !== false) {
    try {
      const htmlRes = await fetch(portalUrl, {
        headers: { "User-Agent": DJPK_CONSTANTS.USER_AGENT },
      });
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        keteranganPortal = extractPortalKeterangan(html);
      }
    } catch {
      // Non-fatal, fallback to undefined
    }
  }

  // 3. Parse and validate rows
  const rows: ApbdRawRow[] = parseDjpkXmlSpreadsheet(rawContent);

  // 4. Compute data hash (for verification and deduplication)
  const dataHash = createHash("sha256").update(rawContent).digest("hex");

  // 5. Extract summaries
  let totalPendapatanAnggaran: number | undefined;
  let totalPendapatanRealisasi: number | undefined;
  let totalBelanjaAnggaran: number | undefined;
  let totalBelanjaRealisasi: number | undefined;
  let totalPembiayaanAnggaran: number | undefined;
  let totalPembiayaanRealisasi: number | undefined;

  for (const r of rows) {
    const name = r.akun.trim().toLowerCase();
    if (name === "pendapatan daerah") {
      totalPendapatanAnggaran = r.anggaran;
      totalPendapatanRealisasi = r.realisasi;
    } else if (name === "belanja daerah") {
      totalBelanjaAnggaran = r.anggaran;
      totalBelanjaRealisasi = r.realisasi;
    } else if (name === "pembiayaan daerah") {
      totalPembiayaanAnggaran = r.anggaran;
      totalPembiayaanRealisasi = r.realisasi;
    }
  }

  const metadata: ApbdMetadata = {
    sourceUrl: portalUrl,
    downloadUrl,
    fetchedAt: new Date().toISOString(),
    httpStatus: response.status,
    keteranganPortal,
    region: {
      provinsiCode: params.provinsi,
      provinsiName: params.provinsi === DJPK_CONSTANTS.DEFAULT_PROVINSI ? DJPK_CONSTANTS.DEFAULT_PROVINSI_NAME : `Provinsi ${params.provinsi}`,
      pemdaCode: params.pemda,
      pemdaName: params.pemda === DJPK_CONSTANTS.DEFAULT_PEMDA ? DJPK_CONSTANTS.DEFAULT_PEMDA_NAME : `Pemda ${params.pemda}`,
    },
    budgetYear: params.tahun,
    periodMonth: params.periode,
    periodName: MONTH_NAMES[params.periode] ?? `Periode ${params.periode}`,
    dataHash,
    rawRowCount: rows.length,
  };

  return {
    metadata,
    rows,
    summary: {
      totalPendapatanAnggaran,
      totalPendapatanRealisasi,
      totalBelanjaAnggaran,
      totalBelanjaRealisasi,
      totalPembiayaanAnggaran,
      totalPembiayaanRealisasi,
    },
  };
}
