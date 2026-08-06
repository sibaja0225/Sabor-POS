import { NextResponse } from "next/server";
import { getProfileForApi } from "@/lib/auth";

export async function GET() {
  const { supabase } = await getProfileForApi();
  if (!supabase) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const db = supabase as any;

  const { data, error } = await db
    .from("cash_shifts")
    .select("*")
    .order("opened_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const shifts = (data ?? []) as Array<Record<string, any>>;

  // Traer nombres de perfil por separado (no hay FK directa a public.profiles para el join embebido)
  const userIds = Array.from(
    new Set(shifts.flatMap((s) => [s.opened_by, s.closed_by]).filter(Boolean))
  );

  if (userIds.length > 0) {
    const { data: profiles } = await db
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);

    const nameById = new Map(
      ((profiles ?? []) as Array<{ id: string; full_name: string }>).map((p) => [p.id, p.full_name])
    );

    for (const s of shifts) {
      s.opener = s.opened_by ? { full_name: nameById.get(s.opened_by) ?? "—" } : null;
      s.closer = s.closed_by ? { full_name: nameById.get(s.closed_by) ?? "—" } : null;
    }
  }

  const active = shifts.find((s) => s.status === "open");

  // Calcular ventas del turno activo del usuario actual (mismo criterio que close_shift)
  if (active) {
    const { data: sales } = await db
      .from("sales")
      .select("total_amount")
      .eq("created_by", active.opened_by)
      .gte("created_at", active.opened_at);

    const rows = (sales ?? []) as Array<{ total_amount: number }>;
    active.sales_count = rows.length;
    active.sales_total = rows.reduce((sum, r) => sum + Number(r.total_amount), 0);
    active.expected_now = Number(active.opening_balance) + active.sales_total;
  }

  return NextResponse.json(shifts);
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
