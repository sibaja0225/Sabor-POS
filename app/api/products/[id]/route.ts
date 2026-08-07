import { NextResponse } from "next/server";
import { canManageCatalog, getProfileForApi } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, profile } = await getProfileForApi();

  if (!supabase || !profile) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!canManageCatalog(profile.role)) {
    return NextResponse.json({ error: "No tienes permiso para actualizar productos" }, { status: 403 });
  }

  const body = await request.json();
  const { id } = await params;

  const payload = {
    name: String(body.name ?? "").trim(),
    category: String(body.category ?? "").trim(),
    sku: String(body.sku ?? "").trim(),
    sale_price: Number(body.sale_price ?? 0),
    cost_price: Number(body.cost_price ?? 0),
    stock: Number(body.stock ?? 0),
    min_stock: Number(body.min_stock ?? 0),
    active: Boolean(body.active)
  };

  const db = supabase as any;
  const { error } = await db.from("products").update(payload).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, profile } = await getProfileForApi();

  if (!supabase || !profile) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!canManageCatalog(profile.role)) {
    return NextResponse.json({ error: "No tienes permiso para eliminar productos" }, { status: 403 });
  }

  const { id } = await params;
  const db = supabase as any;
  const { error } = await db.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
