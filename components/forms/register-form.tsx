"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";

export function RegisterForm() {
  const { t } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        fullName,
        redirectOrigin: window.location.origin
      })
    });

    const result = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(result.error ?? t.auth.registerError);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="form-grid">
        <div className="alert alert-success">
          <strong>{t.auth.checkYourEmail}</strong>
          <p style={{ marginTop: "0.4rem" }}>{t.auth.confirmationSent} <strong>{email}</strong>.</p>
        </div>
        <Link href="/login" className="button" style={{ textAlign: "center" }}>
          {t.auth.goToLogin}
        </Link>
      </div>
    );
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
