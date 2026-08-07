import Link from "next/link";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getDictionary } from "@/lib/i18n/server";

export default async function ResetPasswordPage() {
  const t = await getDictionary();

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-topbar">
          <LanguageToggle />
          <ThemeToggle />
        </div>
        <div className="auth-brand">
          <img
            src="/sabor-pos-logo.png"
            alt="Sabor POS"
            className="auth-logo"
          />
          <div>
            <h1 style={{ margin: 0 }}>{t.auth.appName}</h1>
            <p style={{ marginTop: "4px" }}>{t.auth.tagline}</p>
          </div>
        </div>
        <ResetPasswordForm />
        <p className="muted" style={{ textAlign: "center", marginTop: "0.5rem" }}>
          <Link href="/login">{t.auth.goToLogin}</Link>
        </p>
      </section>
    </main>
  );
}
