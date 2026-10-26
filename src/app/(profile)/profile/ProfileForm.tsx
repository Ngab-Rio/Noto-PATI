"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { updateProfile, type ProfileActionState } from "./actions";

function SaveButton() {
  const { pending } = useFormStatus();
  return <button className="button button-primary" disabled={pending} type="submit">{pending ? "Menyimpan..." : "Simpan perubahan"}</button>;
}

export function ProfileForm({ fullName, phone }: { fullName: string; phone: string }) {
  const [state, action] = useActionState<ProfileActionState, FormData>(updateProfile, {});

  return (
    <form action={action} className="profile-form">
      <label>
        Nama lengkap
        <input defaultValue={fullName} name="fullName" required type="text" />
      </label>
      <label>
        Nomor telepon <span className="muted">opsional</span>
        <input defaultValue={phone} name="phone" type="tel" />
      </label>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      {state.message && <p className="form-success" role="status">{state.message}</p>}
      <SaveButton />
    </form>
  );
}