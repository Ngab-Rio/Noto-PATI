import { describe, expect, it } from "vitest";

import {
  parseOpenAICompatibleResponse,
  reportPhotoAnalysisResponseSchema,
  reportPhotoAnalysisSchema,
} from "./contracts";

describe("report photo analysis response", () => {
  it("accepts supported categories and an optional confidence score", () => {
    expect(reportPhotoAnalysisSchema.safeParse({
      category: "jalan",
      title: "Jalan berlubang di ruas desa",
      description: "Terlihat lubang pada permukaan jalan dalam foto.",
      confidence: 0.82,
    }).success).toBe(true);

    expect(reportPhotoAnalysisSchema.safeParse({
      category: "lampu",
      title: "Penerangan jalan tidak menyala",
      description: "Lampu penerangan pada tiang terlihat tidak menyala.",
      confidence: null,
    }).success).toBe(true);
  });

  it("rejects unsupported categories, malformed confidence, and invalid field lengths", () => {
    expect(reportPhotoAnalysisSchema.safeParse({
      category: "other",
      title: "Jalan berlubang di ruas desa",
      description: "Terlihat lubang pada permukaan jalan dalam foto.",
    }).success).toBe(false);

    expect(reportPhotoAnalysisSchema.safeParse({
      category: "jalan",
      title: "Jalan berlubang di ruas desa",
      description: "Terlihat lubang pada permukaan jalan dalam foto.",
      confidence: 1.2,
    }).success).toBe(false);

    expect(reportPhotoAnalysisSchema.safeParse({
      category: "jalan",
      title: "Pendek",
      description: "Terlihat kerusakan pada foto.",
    }).success).toBe(false);
  });

  it("validates the complete endpoint response before the form consumes it", () => {
    expect(reportPhotoAnalysisResponseSchema.safeParse({
      ok: true,
      analysisId: "e6f4a8f3-6dd8-4e16-9eef-b66c28d8c78f",
      provider: "openai-compatible",
      model: "vision-model",
      analysis: {
        category: "drainase",
        title: "Saluran drainase tertutup material",
        description: "Terlihat material menutupi sebagian saluran drainase.",
        confidence: null,
      },
    }).success).toBe(true);
  });

  it("parses and validates the provider's JSON content", () => {
    expect(parseOpenAICompatibleResponse({
      choices: [{
        message: {
          content: JSON.stringify({
            category: "lampu",
            title: "Lampu penerangan jalan tidak menyala",
            description: "Lampu pada tiang terlihat tidak menyala di dalam foto.",
            confidence: 0.7,
          }),
        },
      }],
    }).category).toBe("lampu");

    expect(() => parseOpenAICompatibleResponse({
      choices: [{ message: { content: '{"category":"unknown"}' } }],
    })).toThrow();
    expect(() => parseOpenAICompatibleResponse({ choices: [] })).toThrow();
  });
});
