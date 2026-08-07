import { NextResponse } from "next/server";
import { canManageCatalog, getProfileForApi } from "@/lib/auth";

export async function POST(request: Request) {
  const { supabase, profile, user } = await getProfileForApi();

  if (!supabase || !profile || !user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const db = supabase as any;

  if (!canManageCatalog(profile.role)) {
    return NextResponse.json({ error: "No tienes permiso para registrar inventario" }, { status: 403 });
  }

  const body = await request.json();
  const quantity = Number(body.quantity ?? 0);
  const movementType = String(body.movement_type ?? "");

  if (!body.product_id || quantity <= 0) {
    return NextResponse.json({ error: "Producto y cantidad son obligatorios" }, { status: 400 });
  }

  const { data: productData, error: productError } = await db
    .from("products")
    .select("id, stock, name")
    .eq("id", body.product_id)
    .single();
  const product = productData as { id: string; stock: number; name: string } | null;

  if (productError || !product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  let newStock = product.stock;

  if (movementType === "in") {
    newStock += quantity;
  } else if (movementType === "out") {
    newStock -= quantity;
  } else if (movementType === "adjustment") {
    newStock = quantity;
  }

  if (movementType === "adjustment" && newStock === product.stock) {
    return NextResponse.json({ error: "El ajuste no genera cambios en el stock" }, { status: 400 });
  }

  if (newStock < 0) {
    return NextResponse.json({ error: "El stock no puede quedar negativo" }, { status: 400 });
  }

  const { error: updateError } = await db.from("products").update({ stock: newStock }).eq("id", product.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  const movementQuantity = movementType === "adjustment" ? Math.abs(newStock - product.stock) || 1 : quantity;
  const { error: insertError } = await db.from("inventory_movements").insert({
    product_id: product.id,
    movement_type: movementType,
    quantity: movementQuantity,
    notes: String(body.notes ?? ""),
    created_by: user.id
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, stock: newStock });
}
