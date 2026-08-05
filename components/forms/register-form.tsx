"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/context";

export function RegisterForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    // 1. Crea la cuenta ya confirmada desde el servidor (sin confirmacion por email).
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setLoading(false);
      setError(result.error ?? t.auth.registerError);
      return;
    }

    // 2. Inicia sesion automaticamente y entra al panel.
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      router.replace("/login?success=" + encodeURIComponent(t.auth.accountCreated));
      router.refresh();
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      {error ? <div className="alert alert-error">{error}</div> : null}
      <div className="field">
        <label htmlFor="full-name">{t.auth.fullName}</label>
        <input
          id="full-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          minLength={3}
        />
      </div>
      <div className="field">
        <label htmlFor="register-email">{t.auth.email}</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="register-password">{t.auth.password}</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <button type="submit" className="button" disabled={loading}>
        {loading ? t.auth.creatingAccount : t.auth.createAccount}
      </button>
    </form>
  );
}
