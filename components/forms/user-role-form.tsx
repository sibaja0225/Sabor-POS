"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";

export function UserRoleForm({
  id,
  role,
  isActive
}: {
  id: string;
  role: "admin" | "manager" | "cashier";
  isActive: boolean;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [nextRole, setNextRole] = useState(role);
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setLoading(true);
    setError("");

    const response = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role: nextRole,
        is_active: active
      })
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error ?? t.users.updateError);
      return;
    }

    router.refresh();
  }

  return (
    <div className="form-grid">
      {error ? <div className="alert alert-error">{error}</div> : null}
      <div className="inline-actions">
        <div className="field">
          <label>{t.users.role}</label>
          <select value={nextRole} onChange={(e) => setNextRole(e.target.value as typeof role)}>
            <option value="admin">{t.users.admin}</option>
            <option value="manager">{t.users.manager}</option>
            <option value="cashier">{t.users.cashier}</option>
          </select>
        </div>
        <div className="field">
          <label>{t.common.status}</label>
          <select value={active ? "true" : "false"} onChange={(e) => setActive(e.target.value === "true")}>
            <option value="true">{t.common.active}</option>
            <option value="false">{t.common.inactive}</option>
          </select>
        </div>
      </div>
      <button type="button" className="button-secondary" onClick={save} disabled={loading}>
        {loading ? t.common.saving : t.common.saveChanges}
      </button>
    </div>
  );
}
