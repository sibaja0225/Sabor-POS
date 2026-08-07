import Link from "next/link";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getDictionary } from "@/lib/i18n/server";

export default async function ForgotPasswordPage() {
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
        <ForgotPasswordForm />
        <p className="muted" style={{ textAlign: "center", marginTop: "0.5rem" }}>
          {t.auth.haveAccount}{" "}
          <Link href="/login">{t.auth.signIn}</Link>
        </p>
      </section>
    </main>
  );
}
