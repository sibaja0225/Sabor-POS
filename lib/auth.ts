import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppProfile = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "manager" | "cashier";
  is_active: boolean;
};

export async function getCurrentProfile(redirectTo = "/login") {
  const supabase = await createClient();
  const db = supabase as any;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(redirectTo);
  }

  const { data: profileData, error } = await db
    .from("profiles")
    .select("id, email, full_name, role, is_active")
    .eq("id", user.id)
    .single();
  const profile = profileData as AppProfile | null;

  if (error || !profile || !profile.is_active) {
    await supabase.auth.signOut();
    redirect("/login?error=Tu%20usuario%20no%20esta%20activo");
  }

  return { supabase, user, profile: profile as AppProfile };
}

/**
 * Versión segura para Route Handlers: devuelve null en lugar de redirigir.
 * Usar en app/api/** para no lanzar excepciones de redirect.
 */
export async function getProfileForApi() {
  const supabase = await createClient();
  const db = supabase as any;
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { supabase: null, user: null, profile: null };

  const { data: profileData, error } = await db
    .from("profiles")
    .select("id, email, full_name, role, is_active")
    .eq("id", user.id)
    .single();
  const profile = profileData as AppProfile | null;

  if (error || !profile || !profile.is_active) return { supabase: null, user: null, profile: null };

  return { supabase, user, profile };
}

export function canManageCatalog(role: AppProfile["role"]) {
  return role === "admin" || role === "manager";
}

export function canManageUsers(role: AppProfile["role"]) {
  return role === "admin";
}

export async function ensureRole(roles: AppProfile["role"][]) {
  const current = await getCurrentProfile();

  if (!roles.includes(current.profile.role)) {
    redirect("/dashboard?error=No%20tienes%20permiso%20para%20acceder%20a%20esta%20seccion");
  }

  return current;
}
