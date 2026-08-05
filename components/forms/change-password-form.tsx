"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";

export function ChangePasswordForm() {
  const { t } = useLanguage();
  const a = t.auth;
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
    setSuccess(false);
    const res = await fetch("/api/auth/update-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(data.error ?? a.changePasswordError); return; }
    setSuccess(true);
    setPassword("");
    setConfirm("");
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid" noValidate>
      <div className="profile-section-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span style={{ fontWeight: 600, fontSize: "1rem" }}>{a.changePasswordTitle}</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && (
        <div className="alert alert-success">{a.changePasswordOk}</div>
      )}

      <div className="field">
        <label htmlFor="change-new-password">{a.newPassword}</label>
        <input
          id="change-new-password"
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
        <label htmlFor="change-confirm-password">{a.confirmPassword}</label>
        <input
          id="change-confirm-password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={6}
          required
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
        />
      </div>

      <button type="submit" className="button" disabled={loading}>
        {loading ? a.changingPassword : a.changePasswordBtn}
      </button>
    </form>
  );
}
