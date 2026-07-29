import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function POST(request: Request) {
  let body: { email?: string; password?: string; fullName?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud invalida." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const fullName = body.fullName?.trim() ?? "";

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: "Completa todos los campos." }, { status: 400 });
  }

  if (fullName.length < 3) {
    return NextResponse.json({ error: "El nombre debe tener al menos 3 caracteres." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "El servidor no esta configurado para registrar usuarios." },
      { status: 500 }
    );
  }

  const admin = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // Create the user with the email already confirmed so no confirmation email
  // is sent. This avoids Supabase's built-in SMTP rate limit ("email rate
  // limit exceeded") and lets staff sign in immediately.
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (error) {
    const message =
      error.message.toLowerCase().includes("already") || error.status === 422
        ? "Ya existe una cuenta con ese correo."
        : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
