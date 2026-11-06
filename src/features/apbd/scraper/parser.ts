import type { ApbdRawRow } from "../types/index.ts";

export class ApbdParseError extends Error {
  readonly details?: unknown;
  constructor(message: string, details?: unknown) {
    super(message);
    this.name = "ApbdParseError";
    this.details = details;
  }
}

export function parseFormattedNumber(val: string | number): number {
  if (typeof val === "number") return val;
  const s = String(val).trim();
  if (!s) return 0;

  // Case 1: Contains both dot and comma (e.g. 1.234.567,89)
  if (s.includes(",") && s.includes(".")) {
    return Number(s.replace(/\./g, "").replace(",", "."));
  }

  // Case 2: Contains comma only (e.g. 9,14 or 1234,5) -> comma is decimal separator
  if (s.includes(",")) {
    return Number(s.replace(",", "."));
  }

  // Case 3: Multiple dots (e.g. 2.719.861.122.000) -> thousand separators
  if ((s.match(/\./g) || []).length > 1) {
    return Number(s.replace(/\./g, ""));
  }

  // Case 4: Single dot: either decimal (9.14) or thousand (e.g. 1.000)
  // If dot is followed by exactly 3 digits at the end and no decimal, could be thousand separator,
  // but in DJPK spreadsheets, percentages are like "9.14" and raw amounts are plain integers.
  return Number(s);
}

/**
 * Parses XML Spreadsheet 2003 (Workbook -> Worksheet -> Table -> Row -> Cell -> Data)
 * produced by DJPK Kemenkeu csv_apbd endpoint.
 */
export function parseDjpkXmlSpreadsheet(xmlContent: string): ApbdRawRow[] {
  if (!xmlContent || typeof xmlContent !== "string") {
    throw new ApbdParseError("Konten spreadsheet kosong atau bukan string.");
  }

  if (!xmlContent.includes("<Workbook") || !xmlContent.includes("<Table>")) {
    throw new ApbdParseError("Format spreadsheet tidak dikenali sebagai XML Spreadsheet 2003.");
  }

  const rows: ApbdRawRow[] = [];
  const rowRegex = /<Row>([\s\S]*?)<\/Row>/g;
  let match: RegExpExecArray | null;
  let rowIndex = 0;

  while ((match = rowRegex.exec(xmlContent)) !== null) {
    const rowContent = match[1];
    const cellRegex = /<Cell[^>]*><Data[^>]*ss:Type="([^"]*)"[^>]*>([\s\S]*?)<\/Data><\/Cell>/g;
    const cells: { type: string; value: string }[] = [];
    let cellMatch: RegExpExecArray | null;

    while ((cellMatch = cellRegex.exec(rowContent)) !== null) {
      cells.push({
        type: cellMatch[1],
        value: cellMatch[2].trim(),
      });
    }

    // Row 0 is the header: Akun | Anggaran | Realisasi | Persentase
    if (rowIndex === 0) {
      if (cells.length < 4 || !cells[0].value.toLowerCase().includes("akun")) {
        throw new ApbdParseError(
          `Header spreadsheet tidak sesuai. Diharapkan [Akun, Anggaran, Realisasi, Persentase], didapatkan: ${JSON.stringify(
            cells.map((c) => c.value)
          )}`
        );
      }
      rowIndex++;
      continue;
    }

    if (cells.length >= 4) {
      const akun = cells[0].value;
      const anggaran = parseFormattedNumber(cells[1].value);
      const realisasi = parseFormattedNumber(cells[2].value);
      const persentase = parseFormattedNumber(cells[3].value);

      if (Number.isNaN(anggaran) || Number.isNaN(realisasi) || Number.isNaN(persentase)) {
        throw new ApbdParseError(
          `Nilai numerik tidak valid pada baris ${rowIndex} (akun: ${akun}): anggaran=${cells[1].value}, realisasi=${cells[2].value}, persentase=${cells[3].value}`
        );
      }

      rows.push({
        akun,
        anggaran,
        realisasi,
        persentase,
      });
    }

    rowIndex++;
  }

  if (rows.length === 0) {
    throw new ApbdParseError("Tidak ada data baris yang ditemukan dalam spreadsheet.");
  }

  return rows;
}

/**
 * Extracts portal metadata such as 'Keterangan' label from the portal HTML page.
 */
export function extractPortalKeterangan(htmlContent: string): string | undefined {
  const match = htmlContent.match(/<label id="keterangan"[^>]*>([\s\S]*?)<\/label>/i);
  if (!match) return undefined;
  return match[1].replace(/\s+/g, " ").trim();
}
