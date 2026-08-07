import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { email, redirectOrigin } = await request.json();
  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

  const supabase = await createClient();

  const redirectTo =
    process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
    `${redirectOrigin ?? ""}/auth/callback?next=/dashboard/profile`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
