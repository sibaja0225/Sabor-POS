"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";

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
      <div className="form-grid">
        <div className="auth-success-icon" aria-hidden="true">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.35rem" }}>{a.checkYourEmail}</p>
          <p className="muted" style={{ fontSize: "0.92rem" }}>
            {a.confirmationSent} <strong>{email}</strong>
          </p>
        </div>
        <div className="alert alert-success" style={{ fontSize: "0.9rem" }}>
          {a.resetLinkSent}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid" noValidate>
      <div>
        <p style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.3rem" }}>
          {a.forgotPasswordTitle}
        </p>
        <p className="muted" style={{ fontSize: "0.9rem" }}>
          {a.forgotPasswordSubtitle}
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="field">
        <label htmlFor="forgot-email">{a.email}</label>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="correo@ejemplo.com"
        />
      </div>

      <button type="submit" className="button" disabled={loading} style={{ width: "100%" }}>
        {loading ? a.sendingLink : a.sendResetLink}
      </button>
    </form>
  );
}
