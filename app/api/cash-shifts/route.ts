import { NextResponse } from "next/server";
import { getProfileForApi } from "@/lib/auth";

export async function GET() {
  const { supabase } = await getProfileForApi();
  if (!supabase) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const db = supabase as any;

  const { data, error } = await db
    .from("cash_shifts")
    .select("*, opener:opened_by(full_name), closer:closed_by(full_name)")
    .order("opened_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { supabase } = await getProfileForApi();
  if (!supabase) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const db = supabase as any;

  const body = await request.json();
  const { action, shift_id, opening_balance, closing_balance, notes } = body;

  if (action === "open") {
    const { data, error } = await db.rpc("open_shift", {
      p_opening_balance: Number(opening_balance ?? 0)
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ id: data });
  }

  if (action === "close") {
    const { error } = await db.rpc("close_shift", {
      p_shift_id: shift_id,
      p_closing_balance: Number(closing_balance ?? 0),
      p_notes: notes ?? null
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
}
