"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  login,
  register,
  signInWithGoogle,
  type AuthActionState,
} from "@/app/auth/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="button button-primary" disabled={pending} type="submit">
      {pending ? "Memproses..." : label}
    </button>
  );
}

export function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const action = mode === "login" ? login : register;
  const [state, formAction] = useActionState<AuthActionState, FormData>(action, {});
  const [googleState, googleFormAction] = useActionState<AuthActionState, FormData>(signInWithGoogle, {});

  return (
    <div className="auth-shell">
      <div className="auth-intro">
        <span className="eyebrow">Noto PATI · identitas warga</span>
        <h1>{mode === "login" ? "Selamat datang kembali." : "Buat akun warga."}</h1>
        <p>
          {mode === "login"
            ? "Masuk untuk melanjutkan kontribusi dan memantau laporan Anda."
            : "Satu akun untuk melaporkan kebutuhan di sekitar Kabupaten Pati."}
        </p>
      </div>

      {/* Main Form Card */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6 md:p-8 shadow-xs">
        <form action={formAction} className="auth-form">
          <input name="next" type="hidden" value={next} />
          {mode === "register" && (
            <label>
              Nama lengkap
              <input autoComplete="name" name="fullName" required type="text" />
            </label>
          )}
          <label>
            Email
            <input autoComplete="email" name="email" required type="email" />
          </label>
          <label>
            Password
            <input autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} name="password" required type="password" />
          </label>
          {mode === "register" && (
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input type="checkbox" required className="mt-0.5" />
              <span className="text-text-muted">
                Saya menyetujui{" "}
                <Link href="/kebijakan-privasi" target="_blank" className="text-primary hover:text-primary-dark hover:underline font-medium">
                  Kebijakan Privasi
                </Link>{" "}
                dan{" "}
                <Link href="/syarat-ketentuan" target="_blank" className="text-primary hover:text-primary-dark hover:underline font-medium">
                  Syarat & Ketentuan
                </Link>
              </span>
            </label>
          )}
          {state.error && <p className="form-error" role="alert">{state.error}</p>}
          {state.message && <p className="form-success" role="status">{state.message}</p>}
          <SubmitButton label={mode === "login" ? "Masuk" : "Daftar"} />
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-surface px-2 text-text-muted">atau</span>
          </div>
        </div>

        {/* Google Sign In */}
        <form action={googleFormAction}>
          <input name="next" type="hidden" value={next} />
          <button className="button button-secondary w-full flex items-center justify-center" type="submit">
            <svg className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm sm:text-base">Lanjutkan dengan Google</span>
          </button>
        </form>
        {googleState.error && <p className="form-error mt-3" role="alert">{googleState.error}</p>}
      </div>

      {/* Switch Auth Mode Link */}
      <div className="text-center mt-6">
        <p className="text-sm text-text-muted">
          {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
          <Link 
            href={mode === "login" ? `/register?next=${encodeURIComponent(next)}` : `/login?next=${encodeURIComponent(next)}`}
            className="text-primary hover:text-primary-dark font-semibold hover:underline"
          >
            {mode === "login" ? "Daftar sekarang" : "Masuk di sini"}
          </Link>
        </p>
      </div>
    </div>
  );
}