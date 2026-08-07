"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/context";

export function SignOutButton() {
  const router = useRouter();
  const { t } = useLanguage();

  async function handleClick() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button type="button" className="button-secondary" onClick={handleClick}>
      {t.nav.signOut}
    </button>
  );
}
