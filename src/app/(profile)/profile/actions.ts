"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/guards";

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Nama minimal 2 karakter.").max(100),
  phone: z.string().trim().max(30, "Nomor telepon terlalu panjang."),
});

export type ProfileActionState = { error?: string; message?: string };

export async function updateProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const values = profileSchema.safeParse({
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  });

  if (!values.success) {
    return { error: values.error.issues[0]?.message ?? "Data profil tidak valid." };
  }

  const { supabase, user } = await getCurrentUser();
  if (!user) {
    return { error: "Sesi Anda telah berakhir. Silakan masuk kembali." };
  }
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: values.data.fullName, phone: values.data.phone || null })
    .eq("id", user.id);

  if (error) {
    return { error: "Profil belum dapat diperbarui. Silakan coba lagi." };
  }

  revalidatePath("/profile");
  return { message: "Profil berhasil diperbarui." };
}