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
    setTimeout(() => router.replace("/dashboard"), 2000);
  }

  if (success) {
    return (
      <div className="auth-card" style={{ textAlign: "center" }}>
        <p style={{ fontSize: "1.1rem", color: "var(--success)", fontWeight: 600 }}>{a.resetSuccess}</p>
      </div>
    );
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit} noValidate>
      <h1 className="auth-title">{a.resetPasswordTitle}</h1>
      <p className="auth-subtitle">{a.resetPasswordSubtitle}</p>

      {error && <p className="form-error">{error}</p>}

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

      <button type="submit" className="button button-primary" disabled={loading} style={{ width: "100%", marginTop: "0.5rem" }}>
        {loading ? a.resettingPassword : a.resetPasswordBtn}
      </button>
    </form>
  );
}
