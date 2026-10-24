"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().trim().email("Masukkan email yang valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});

const registrationSchema = credentialsSchema.extend({
  fullName: z.string().trim().min(2, "Nama minimal 2 karakter.").max(100),
});

export type AuthActionState = {
  error?: string;
  message?: string;
};

function getFormValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

export async function login(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const values = credentialsSchema.safeParse({
    email: getFormValue(formData, "email"),
    password: getFormValue(formData, "password"),
  });

  if (!values.success) {
    return { error: values.error.issues[0]?.message ?? "Data login tidak valid." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(values.data);

  if (error) {
    return { error: "Email atau password salah. Silakan coba lagi." };
  }

  redirect(getSafeRedirectPath(getFormValue(formData, "next"), "/"));
}

export async function register(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const values = registrationSchema.safeParse({
    email: getFormValue(formData, "email"),
    password: getFormValue(formData, "password"),
    fullName: getFormValue(formData, "fullName"),
  });

  if (!values.success) {
    return { error: values.error.issues[0]?.message ?? "Data pendaftaran tidak valid." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: values.data.email,
    password: values.data.password,
    options: { data: { full_name: values.data.fullName } },
  });

  if (error) {
    return { error: "Pendaftaran gagal. Periksa data dan coba lagi." };
  }

  if (!data.session) {
    return { message: "Akun dibuat. Periksa email Anda untuk memverifikasi akun." };
  }

  redirect(getSafeRedirectPath(getFormValue(formData, "next"), "/profile"));
}

export async function signInWithGoogle(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const supabase = await createClient();
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

  if (!origin) {
    return { error: "Konfigurasi URL aplikasi belum tersedia." };
  }

  const next = getSafeRedirectPath(getFormValue(formData, "next"), "/profile");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });

  if (error || !data.url) {
    return { error: "Login Google belum tersedia atau gagal dimulai." };
  }

  redirect(data.url);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}