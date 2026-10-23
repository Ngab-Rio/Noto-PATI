import { z } from "zod";

/**
 * Skema validasi untuk variabel environment sisi klien (browser).
 * Hanya memuat variabel yang berawalan NEXT_PUBLIC_.
 */
export const envClientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL harus berupa URL yang valid (mis. http://localhost:3000)")
    .default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL harus berupa URL Supabase yang valid"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY tidak boleh kosong"),
  NEXT_PUBLIC_ENABLE_MOCK_LOCATION: z
    .enum(["true", "false"])
    .default("false")
    .transform((val) => val === "true"),
});

function validateClientEnv() {
  const result = envClientSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_ENABLE_MOCK_LOCATION: process.env.NEXT_PUBLIC_ENABLE_MOCK_LOCATION,
  });

  if (!result.success) {
    const formattedErrors = result.error.issues
      .map((err) => `  - [${err.path.join(".")}]: ${err.message}`)
      .join("\n");

    const message = [
      "\n==================================================================",
      "❌ KONFIGURASI ENVIRONMENT CLIENT TIDAK VALID:",
      "==================================================================",
      formattedErrors,
      "\n👉 SOLUSI: Pastikan file .env.local telah dibuat berdasarkan .env.example",
      "==================================================================\n",
    ].join("\n");

    console.error(message);
    throw new Error("Konfigurasi environment client gagal divalidasi.");
  }

  return result.data;
}

export const clientEnv = validateClientEnv();

export type ClientEnv = z.infer<typeof envClientSchema>;
