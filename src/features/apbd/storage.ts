import fs from "node:fs/promises";
import path from "node:path";
import type { ApbdExtractionResult } from "./types/index.ts";

export interface SaveApbdOptions {
  outputDir?: string;
}

/**
 * Saves the extracted APBD data and metadata into a structured JSON file.
 * File format: apbd_{tahun}_{periode}_{pemda}.json
 */
export async function saveApbdRawResult(
  result: ApbdExtractionResult,
  options: SaveApbdOptions = {}
): Promise<{ filePath: string; fileName: string }> {
  const outputDir = options.outputDir ?? path.resolve(process.cwd(), "data/raw/apbd");
  await fs.mkdir(outputDir, { recursive: true });

  const { budgetYear, periodMonth, region } = result.metadata;
  const fileName = `apbd_${budgetYear}_m${String(periodMonth).padStart(2, "0")}_pemda${region.pemdaCode}.json`;
  const filePath = path.join(outputDir, fileName);

  const jsonContent = JSON.stringify(result, null, 2);
  await fs.writeFile(filePath, jsonContent, "utf8");

  return { filePath, fileName };
}

/**
 * Reads a previously saved structured JSON file.
 */
export async function loadApbdRawResult(filePath: string): Promise<ApbdExtractionResult> {
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content) as ApbdExtractionResult;
}
