import { NextResponse } from "next/server";

import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeRedirectPath(requestUrl.searchParams.get("next"), "/profile");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (roleData?.role === "admin") {
        return NextResponse.redirect(new URL("/admin", requestUrl.origin));
      }
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}