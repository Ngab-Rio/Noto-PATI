import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { createClient } from "@supabase/supabase-js";

import { importApbdSnapshot } from "../src/features/apbd/importer";
import { normalizeApbdResult } from "../src/features/apbd/normalizer";
import { validateApbdNormalization } from "../src/features/apbd/validation";

interface CliOptions {
  file?: string;
  dir: string;
  dryRun: boolean;
}

function printUsage() {
  console.log(`
Usage:
  npm run import:apbd -- [--file <path>] [--dir <dir>] [--dry-run]

Options:
  --file      Impor satu file JSON hasil scraper
  --dir       Impor semua file apbd_*.json dalam direktori (default: data/raw/apbd)
  --dry-run   Normalisasi dan validasi saja, tanpa menulis ke Supabase
  --help, -h  Tampilkan panduan ini
`);
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    dir: path.resolve(process.cwd(), "data/raw/apbd"),
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--file" && args[i + 1]) {
      options.file = path.resolve(process.cwd(), args[++i]);
    } else if (arg === "--dir" && args[i + 1]) {
      options.dir = path.resolve(process.cwd(), args[++i]);
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    } else {
      console.error(`Error: argumen tidak dikenal "${arg}".`);
      printUsage();
      process.exit(1);
    }
  }

  return options;
}

async function collectFiles(options: CliOptions): Promise<string[]> {
  if (options.file) return [options.file];

  const entries = await readdir(options.dir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && /^apbd_.*\.json$/.test(entry.name))
    .map((entry) => path.join(options.dir, entry.name))
    .sort();
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} wajib diisi untuk impor APBD.`);
  }
  return value;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const files = await collectFiles(options);

  if (files.length === 0) {
    throw new Error(`Tidak ada file apbd_*.json di ${options.dir}.`);
  }

  const client = options.dryRun
    ? null
    : createClient(
        requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
        requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
        { auth: { autoRefreshToken: false, persistSession: false } },
      );

  let failedFiles = 0;

  for (const file of files) {
    const fileName = path.relative(process.cwd(), file);
    console.log(`\n▶ ${fileName}`);

    let parsed: unknown;
    try {
      parsed = JSON.parse(await readFile(file, "utf8"));
    } catch (error) {
      failedFiles++;
      console.error(`  ✗ Gagal membaca JSON: ${(error as Error).message}`);
      continue;
    }

    const normalized = normalizeApbdResult(parsed);
    const validation = validateApbdNormalization(normalized);
    const validCount = validation.data?.accounts.length ?? 0;
    const invalidCount = normalized.accounts.length - validCount;

    for (const warning of validation.warnings) {
      console.warn(`  ! ${warning}`);
    }
    for (const error of validation.errors) {
      console.error(`  ✗ ${error.path}: ${error.message}`);
    }

    if (!validation.data) {
      failedFiles++;
      console.error(
        `  ✗ Snapshot ditolak: ${validCount} akun valid, ${invalidCount} akun gagal.`,
      );
      continue;
    }

    if (!client) {
      console.log(
        `  ✓ Dry-run: ${validCount} akun valid, ${invalidCount} akun gagal (tidak ditulis).`,
      );
      if (validation.errors.length > 0) failedFiles++;
      continue;
    }

    try {
      const result = await importApbdSnapshot(client, validation.data);
      console.log(
        `  ✓ Tersimpan: ${result.accountCount} akun, ${result.staleDeleted} baris stale dihapus, ` +
          `${invalidCount} akun gagal. report_id=${result.reportId}`,
      );
    } catch (error) {
      failedFiles++;
      console.error(`  ✗ Impor gagal: ${(error as Error).message}`);
    }

    if (validation.errors.length > 0) failedFiles++;
  }

  console.log(
    `\nRingkasan: ${files.length - failedFiles}/${files.length} file berhasil tanpa error.`,
  );

  if (failedFiles > 0) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(`\n✗ ${(error as Error).message}`);
  process.exitCode = 1;
});
