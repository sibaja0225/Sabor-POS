import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { getDictionary } from "@/lib/i18n/server";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const t = await getDictionary();

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-topbar">
          <LanguageToggle />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px"
          }}
        >

    <img
  src="/sabor-pos-logo.png"
  alt="Sabor POS"
  style={{
    width: "98px",
    height: "108px",
    objectFit: "contain",
    flexShrink: 0
  }}
/>

          <div>
            <h1 style={{ margin: 0 }}>{t.auth.appName}</h1>
            <p style={{ marginTop: "4px" }}>
              {t.auth.tagline}
            </p>
          </div>

        </div>

        {params.error ? (
          <div className="alert alert-error">{params.error}</div>
        ) : null}

        {params.success ? (
          <div className="alert alert-success">{params.success}</div>
        ) : null}

        <LoginForm />

        <p className="muted">
          {t.auth.noAccount} <Link href="/register">{t.auth.createAccount}</Link>
        </p>

      </section>
    </main>
  );
}
