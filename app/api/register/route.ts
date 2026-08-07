import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: { email?: string; password?: string; fullName?: string; redirectOrigin?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud invalida" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const fullName = body.fullName?.trim() ?? "";
  const redirectOrigin = body.redirectOrigin ?? "";

  if (!email || !password || fullName.length < 3) {
    return NextResponse.json(
      { error: "Completa nombre, correo y contrasena." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "La contrasena debe tener al menos 6 caracteres." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const emailRedirectTo =
    process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
    `${redirectOrigin}/auth/callback`;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: { full_name: fullName }
    }
  });

  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese correo." },
        { status: 409 }
      );
    }
    if (msg.includes("invalid") && msg.includes("email")) {
      return NextResponse.json(
        { error: "El correo electronico no es valido." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "No fue posible crear la cuenta." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
