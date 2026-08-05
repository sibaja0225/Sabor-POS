import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // next puede ser "/reset-password" (desde enlace de reset) o "/dashboard"
  const redirectTo = next.startsWith("/") ? `${origin}${next}` : `${origin}/dashboard`;
  return NextResponse.redirect(redirectTo);
}
