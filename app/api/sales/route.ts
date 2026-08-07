import { NextResponse } from "next/server";
import { getProfileForApi } from "@/lib/auth";

export async function POST(request: Request) {
  const { supabase } = await getProfileForApi();

  if (!supabase) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const db = supabase as any;
  const body = await request.json();
  const items = Array.isArray(body.items) ? body.items : [];

  if (!items.length) {
    return NextResponse.json({ error: "Debes agregar al menos una linea a la venta" }, { status: 400 });
  }

  const { data: saleId, error } = await db.rpc("register_sale", {
    p_customer_name: body.customer_name || null,
    p_payment_method: body.payment_method || "efectivo",
    p_items: items,
    p_discount_pct: Number(body.discount_pct ?? 0),
    p_tax_pct: Number(body.tax_pct ?? 0)
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data: sale } = await db
    .from("sales")
    .select("invoice_number, created_at")
    .eq("id", saleId)
    .single();

  return NextResponse.json({
    id: saleId,
    invoice_number: sale?.invoice_number ?? null,
    created_at: sale?.created_at ?? null
  });
}
