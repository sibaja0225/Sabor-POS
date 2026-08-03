import Link from "next/link";
import { RegisterForm } from "@/components/forms/register-form";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { getDictionary } from "@/lib/i18n/server";

export default async function RegisterPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const t = await getDictionary();

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-topbar">
          <LanguageToggle />
        </div>
        <h1>{t.auth.registerTitle}</h1>
        <p>{t.auth.registerSubtitle}</p>
        {params.error ? <div className="alert alert-error">{params.error}</div> : null}
        <RegisterForm />
        <p className="muted">
          {t.auth.haveAccount} <Link href="/login">{t.auth.signIn}</Link>
        </p>
      </section>
    </main>
  );
}
