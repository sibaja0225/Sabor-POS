import type { ReactNode } from "react";
import { getCurrentProfile } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default async function DashboardLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const { profile } = await getCurrentProfile();

  return (
    <div className="dashboard-shell">
      <Sidebar role={profile.role} name={profile.full_name} />
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            {/* Espacio reservado para el botón hamburguesa que se renderiza en Sidebar */}
            <div className="hamburger-placeholder" aria-hidden="true" />
            <div className="topbar-card">
              <strong>{profile.full_name}</strong>
              <div className="muted topbar-email">{profile.email}</div>
            </div>
          </div>
          <div className="topbar-actions">
            <ThemeToggle />
            <LanguageToggle />
            <SignOutButton />
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
