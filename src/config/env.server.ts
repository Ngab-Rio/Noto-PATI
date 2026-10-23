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
});

function validateServerEnv() {
  const result = envServerSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    CRON_SECRET: process.env.CRON_SECRET,
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
