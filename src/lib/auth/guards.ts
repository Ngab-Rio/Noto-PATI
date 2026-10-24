import "server-only";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AppRole = "warga" | "admin";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function getCurrentRole(userId: string): Promise<AppRole | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.role === "admin" || data?.role === "warga" ? data.role : null;
}

export async function requireUser(nextPath = "/profile") {
  const { user } = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser("/admin");
  const role = await getCurrentRole(user.id);

  if (role !== "admin") {
    redirect("/unauthorized");
  }

  return user;
}