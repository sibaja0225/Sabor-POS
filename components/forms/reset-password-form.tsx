"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";

export function ResetPasswordForm() {
  const { t } = useLanguage();
  const a = t.auth;
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError(a.passwordsNoMatch); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(data.error ?? a.changePasswordError); return; }
    setSuccess(true);
    setTimeout(() => router.replace("/dashboard"), 2200);
  }

  if (success) {
    return (
      <div className="form-grid">
        <div className="auth-success-icon" aria-hidden="true">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div className="alert alert-success">
          <strong>{a.resetSuccess}</strong>
          <p className="muted" style={{ fontSize: "0.88rem", marginTop: "0.25rem" }}>
            Redirigiendo al dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid" noValidate>
      <div>
        <p style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.3rem" }}>
          {a.resetPasswordTitle}
        </p>
        <p className="muted" style={{ fontSize: "0.9rem" }}>
          {a.resetPasswordSubtitle}
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="field">
        <label htmlFor="new-password">{a.newPassword}</label>
        <input
          id="new-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
        />
      </div>

      <div className="field">
        <label htmlFor="confirm-password">{a.confirmPassword}</label>
        <input
          id="confirm-password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={6}
          required
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
        />
      </div>

      <button type="submit" className="button" disabled={loading} style={{ width: "100%" }}>
        {loading ? a.resettingPassword : a.resetPasswordBtn}
      </button>
    </form>
  );
}
