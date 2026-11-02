import { z } from "zod";

export const REPORT_CATEGORIES = [
  "jalan",
  "lampu",
  "drainase",
  "jembatan",
  "tanggul",
  "trotoar",
  "rambu",
  "lainnya",
] as const;

export const reportPhotoAnalysisSchema = z.object({
  category: z.enum(REPORT_CATEGORIES),
  title: z.string().trim().min(10).max(100),
  description: z.string().trim().min(20).max(1000),
  confidence: z.number().min(0).max(1).nullable().optional(),
});

export const reportPhotoAnalysisResponseSchema = z.object({
  ok: z.literal(true),
  analysisId: z.string().uuid(),
  analysis: reportPhotoAnalysisSchema,
  provider: z.string().min(1),
  model: z.string().min(1),
});

export type ReportPhotoAnalysis = z.infer<typeof reportPhotoAnalysisSchema>;
export type ReportPhotoAnalysisResponse = z.infer<typeof reportPhotoAnalysisResponseSchema>;

export function parseOpenAICompatibleResponse(payload: unknown): ReportPhotoAnalysis {
  if (!payload || typeof payload !== "object" || !("choices" in payload) || !Array.isArray(payload.choices)) {
    throw new Error("Missing model choices");
  }

  const firstChoice: unknown = payload.choices[0];
  if (!firstChoice || typeof firstChoice !== "object" || !("message" in firstChoice)) {
    throw new Error("Missing model message");
  }

  const message: unknown = firstChoice.message;
  if (!message || typeof message !== "object" || !("content" in message) || typeof message.content !== "string") {
    throw new Error("Missing model content");
  }

  return reportPhotoAnalysisSchema.parse(JSON.parse(message.content));
}

export type PhotoInput = {
  bytes: Uint8Array;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
};

export interface ReportPhotoAnalyzer {
  readonly provider: string;
  readonly model: string;
  analyze(photo: PhotoInput): Promise<ReportPhotoAnalysis>;
}

export interface PhotoClassifier {
  classify(photo: PhotoInput): Promise<{
    category: (typeof REPORT_CATEGORIES)[number];
    confidence: number | null;
    model: string | null;
  }>;
}
