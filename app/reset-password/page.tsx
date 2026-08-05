import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getDictionary } from "@/lib/i18n/server";

export default async function ResetPasswordPage() {
  await getDictionary();
  return (
    <div className="auth-shell">
      <div className="auth-topbar">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <main className="auth-center">
        <ResetPasswordForm />
      </main>
    </div>
  );
}
