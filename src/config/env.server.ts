import "server-only";
import { z } from "zod";

/**
 * Skema validasi untuk variabel environment sisi server.
 * File ini memuat rahasia (secrets) dan tidak boleh diimpor dari bundle browser.
 */
export const envServerSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY wajib diisi untuk operasional server/admin")
    .optional(),
  CRON_SECRET: z
    .string()
    .min(1, "CRON_SECRET wajib diisi untuk verifikasi route cron")
    .optional(),
  AI_VISION_BASE_URL: z.string().url().optional(),
  AI_VISION_API_KEY: z.string().min(1).optional(),
  AI_VISION_MODEL: z.string().min(1).optional(),
  /**
   * ⚠️ TEMPORARY: Additional allowed origins for development tunnels.
   * This variable is used for testing AI photo analysis via ngrok, localtunnel,
   * or VS Code dev tunnels during development.
   * 
   * WARNING: This variable MUST BE REMOVED in production deployment.
   * Production should only allow NEXT_PUBLIC_APP_URL as the origin.
   */
  AI_ANALYSIS_ALLOWED_ORIGINS: z.string().optional(),
}).superRefine((env, context) => {
  const providerValues = [
    env.AI_VISION_BASE_URL,
    env.AI_VISION_API_KEY,
    env.AI_VISION_MODEL,
  ];
  const configuredValues = providerValues.filter(Boolean).length;

  if (configuredValues > 0 && configuredValues < providerValues.length) {
    context.addIssue({
      code: "custom",
      message: "AI_VISION_BASE_URL, AI_VISION_API_KEY, dan AI_VISION_MODEL harus diisi bersama.",
      path: ["AI_VISION_BASE_URL"],
    });
  }

  for (const origin of env.AI_ANALYSIS_ALLOWED_ORIGINS?.split(",").filter((value) => value.trim()) ?? []) {
    try {
      const parsedOrigin = new URL(origin.trim());
      if (!["http:", "https:"].includes(parsedOrigin.protocol)
        || parsedOrigin.origin !== origin.trim().replace(/\/+$/, "")) {
        throw new Error("Origin must not include a path or query.");
      }
    } catch {
      context.addIssue({
        code: "custom",
        message: "AI_ANALYSIS_ALLOWED_ORIGINS harus berupa daftar origin http(s) yang valid, dipisahkan koma.",
        path: ["AI_ANALYSIS_ALLOWED_ORIGINS"],
      });
      break;
    }
  }
});

function validateServerEnv() {
  const result = envServerSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
    AI_VISION_BASE_URL: process.env.AI_VISION_BASE_URL,
    AI_VISION_API_KEY: process.env.AI_VISION_API_KEY,
    AI_VISION_MODEL: process.env.AI_VISION_MODEL,
    AI_ANALYSIS_ALLOWED_ORIGINS: process.env.AI_ANALYSIS_ALLOWED_ORIGINS,
  });

  if (!result.success) {
    const formattedErrors = result.error.issues
      .map((err) => `  - [${err.path.join(".")}]: ${err.message}`)
      .join("\n");

    const message = [
      "\n==================================================================",
      "❌ KONFIGURASI ENVIRONMENT SERVER TIDAK VALID:",
      "==================================================================",
      formattedErrors,
      "\n👉 SOLUSI: Periksa variabel server di .env.local atau deployment environment",
      "==================================================================\n",
    ].join("\n");

    console.error(message);
    throw new Error("Konfigurasi environment server gagal divalidasi.");
  }

  return result.data;
}

export const serverEnv = validateServerEnv();

export type ServerEnv = z.infer<typeof envServerSchema>;
