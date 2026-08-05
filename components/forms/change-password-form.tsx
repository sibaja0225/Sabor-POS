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
    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <h2>{a.changePasswordTitle}</h2>

      {error && <p className="form-error">{error}</p>}
      {success && <p style={{ color: "var(--success)", fontSize: "0.9rem" }}>{a.changePasswordOk}</p>}

      <div className="form-field">
        <label className="form-label">{a.newPassword}</label>
        <input
          type="password"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
          autoComplete="new-password"
        />
      </div>

      <div className="form-field">
        <label className="form-label">{a.confirmPassword}</label>
        <input
          type="password"
          className="form-input"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          minLength={6}
          required
          autoComplete="new-password"
        />
      </div>

      <button type="submit" className="button button-primary" disabled={loading}>
        {loading ? a.changingPassword : a.changePasswordBtn}
      </button>
    </form>
  );
}
