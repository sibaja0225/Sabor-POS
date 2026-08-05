import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CashRegisterPanel } from "@/components/cash-register/cash-register-panel";
import { getDictionary } from "@/lib/i18n/server";

export default async function CashRegisterPage() {
  await getCurrentProfile(); // redirige si no autenticado
  await getDictionary();

  const supabase = await createClient();
  const db = supabase as any;

  const { data: shifts } = await db
    .from("cash_shifts")
    .select("*, opener:opened_by(full_name), closer:closed_by(full_name)")
    .order("opened_at", { ascending: false })
    .limit(50);

  return <CashRegisterPanel initialShifts={shifts ?? []} />;
}
