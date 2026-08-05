import { NextResponse } from "next/server";
import { canManageUsers, getProfileForApi } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, profile } = await getProfileForApi();

  if (!supabase || !profile) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const db = supabase as any;

  if (!canManageUsers(profile.role)) {
    return NextResponse.json({ error: "No tienes permiso para gestionar usuarios" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const { error } = await db
    .from("profiles")
    .update({
      role: body.role,
      is_active: Boolean(body.is_active)
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
