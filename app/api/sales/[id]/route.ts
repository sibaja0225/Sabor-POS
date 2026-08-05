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
    return NextResponse.json({ error: "No tienes permiso para editar facturas" }, { status: 403 });
  }

  const body = await request.json();
  const { id } = await params;
  const db = supabase as any;

  const payload = {
    customer_name: String(body.customer_name ?? "").trim() || null,
    payment_method: String(body.payment_method ?? "efectivo").trim()
  };

  const { error } = await db.from("sales").update(payload).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { supabase, profile, user } = await getProfileForApi();

  if (!supabase || !profile || !user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!canManageCatalog(profile.role)) {
    return NextResponse.json({ error: "No tienes permiso para eliminar facturas" }, { status: 403 });
  }

  const { id } = await params;
  const db = supabase as any;

  const { data: sale, error: saleError } = await db
    .from("sales")
    .select("id, invoice_number")
    .eq("id", id)
    .single();

  if (saleError || !sale) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  }

  const { data: items, error: itemsError } = await db
    .from("sale_items")
    .select("product_id, quantity")
    .eq("sale_id", id);

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 400 });
  }

  for (const item of items ?? []) {
    const { data: product, error: productError } = await db
      .from("products")
      .select("stock")
      .eq("id", item.product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: "No fue posible restaurar el inventario" }, { status: 400 });
    }

    const { error: stockError } = await db
      .from("products")
      .update({ stock: Number(product.stock) + Number(item.quantity) })
      .eq("id", item.product_id);

    if (stockError) {
      return NextResponse.json({ error: stockError.message }, { status: 400 });
    }

    await db.from("inventory_movements").insert({
      product_id: item.product_id,
      movement_type: "adjustment",
      quantity: Number(item.quantity),
      notes: `Reintegro por eliminacion de factura ${sale.invoice_number}`,
      created_by: user.id
    });
  }

  const { error: deleteError } = await db.from("sales").delete().eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
