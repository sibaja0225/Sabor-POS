"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";

export function ForgotPasswordForm() {
  const { t } = useLanguage();
  const a = t.auth;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, redirectOrigin: window.location.origin })
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Error al enviar el enlace"); return; }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>✉</div>
        <h1 className="auth-title">{a.resetLinkSent}</h1>
        <p className="muted" style={{ margin: "0.5rem 0 1.5rem" }}>{a.confirmationSent} <strong>{email}</strong></p>
        <Link href="/login" className="button button-secondary" style={{ display: "inline-block" }}>
          {a.goToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit} noValidate>
      <h1 className="auth-title">{a.forgotPasswordTitle}</h1>
      <p className="auth-subtitle">{a.forgotPasswordSubtitle}</p>

      {error && <p className="form-error">{error}</p>}

      <div className="form-field">
        <label className="form-label">{t.auth.email}</label>
        <input
          type="email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <button type="submit" className="button button-primary" disabled={loading} style={{ width: "100%", marginTop: "0.5rem" }}>
        {loading ? a.sendingLink : a.sendResetLink}
      </button>

      <p className="auth-footer">
        <Link href="/login">{a.goToLogin}</Link>
      </p>
    </form>
  );
}
