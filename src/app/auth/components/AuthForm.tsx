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
        {state.error && <p className="form-error" role="alert">{state.error}</p>}
        {state.message && <p className="form-success" role="status">{state.message}</p>}
        <SubmitButton label={mode === "login" ? "Masuk" : "Daftar"} />
      </form>
      <form action={googleFormAction}>
        <input name="next" type="hidden" value={next} />
        <button className="button button-secondary" type="submit">Lanjutkan dengan Google</button>
      </form>
      {googleState.error && <p className="form-error" role="alert">{googleState.error}</p>}
      <p className="auth-switch">
        {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
        <Link href={mode === "login" ? `/register?next=${encodeURIComponent(next)}` : `/login?next=${encodeURIComponent(next)}`}>
          {mode === "login" ? "Daftar sekarang" : "Masuk di sini"}
        </Link>
      </p>
    </div>
  );
}