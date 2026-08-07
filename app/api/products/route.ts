import { NextResponse } from "next/server";
import { getProfileForApi, canManageCatalog } from "@/lib/auth";

export async function POST(request: Request) {
  const { supabase, profile } = await getProfileForApi();

  if (!supabase || !profile) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const db = supabase as any;

  if (!canManageCatalog(profile.role)) {
    return NextResponse.json({ error: "No tienes permiso para crear productos" }, { status: 403 });
  }

  const body = await request.json();
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

  if (!payload.name || !payload.category || !payload.sku) {
    return NextResponse.json({ error: "Completa todos los campos obligatorios" }, { status: 400 });
  }

  const { data, error } = await db.from("products").insert(payload).select("id").single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ id: data.id });
}
