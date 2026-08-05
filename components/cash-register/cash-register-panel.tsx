"use client";

import { useState, useCallback } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Shift {
  id: string;
  status: "open" | "closed";
  opening_balance: number;
  closing_balance: number | null;
  expected_cash: number | null;
  difference: number | null;
  opened_at: string;
  closed_at: string | null;
  notes: string | null;
  opener?: { full_name: string } | null;
  closer?: { full_name: string } | null;
}

interface Props {
  initialShifts: Shift[];
}

export function CashRegisterPanel({ initialShifts }: Props) {
  const { t } = useLanguage();
  const cr = t.cashRegister;
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [closingBalance, setClosingBalance] = useState("");
  const [notes, setNotes] = useState("");

  const activeShift = shifts.find((s) => s.status === "open") ?? null;
  const history = shifts.filter((s) => s.status === "closed");

  const reload = useCallback(async () => {
    const res = await fetch("/api/cash-shifts");
    if (res.ok) setShifts(await res.json());
  }, []);

  async function handleOpen(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/cash-shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "open", opening_balance: openingBalance })
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(data.error ?? cr.openError); return; }
    setOpeningBalance("");
    await reload();
  }

  async function handleClose(e: React.FormEvent) {
    e.preventDefault();
    if (!activeShift) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/cash-shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "close", shift_id: activeShift.id, closing_balance: closingBalance, notes })
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) { setError(data.error ?? cr.closeError); return; }
    setClosingBalance("");
    setNotes("");
    await reload();
  }

  const diffClass = (d: number | null) => {
    if (d === null) return "";
    if (d > 0) return "positive";
    if (d < 0) return "negative";
    return "";
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>{cr.title}</h1>
          <p className="muted">{cr.subtitle}</p>
        </div>
      </div>

      {error && <p className="form-error" style={{ marginBottom: "1rem" }}>{error}</p>}

      {/* Estado actual del turno */}
      <div className={`shift-status-banner${activeShift ? " shift-open" : ""}`} style={{ marginBottom: "1.5rem" }}>
        <div>
          <span className={`shift-badge ${activeShift ? "open" : "closed"}`}>
            {activeShift ? cr.open : cr.noActiveShift}
          </span>
          {activeShift && (
            <p className="muted" style={{ fontSize: "0.85rem", marginTop: "0.3rem" }}>
              {cr.openedAt} {formatDate(activeShift.opened_at)}
              {activeShift.opener ? ` — ${cr.by} ${activeShift.opener.full_name}` : ""}
            </p>
          )}
        </div>
        {activeShift && (
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <div>
              <div className="arqueo-label">{cr.openingBalance}</div>
              <div className="arqueo-value">{formatCurrency(activeShift.opening_balance)}</div>
            </div>
          </div>
        )}
      </div>

      <div className="two-columns" style={{ gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Abrir turno */}
        {!activeShift && (
          <article className="card">
            <h2>{cr.openShift}</h2>
            <form onSubmit={handleOpen} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <div className="form-field">
                <label className="form-label">{cr.openingBalance}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="button button-primary" disabled={loading}>
                {loading ? cr.opening : cr.openShiftBtn}
              </button>
            </form>
          </article>
        )}

        {/* Cerrar turno */}
        {activeShift && (
          <article className="card">
            <h2>{cr.closeShift}</h2>
            <form onSubmit={handleClose} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              <div className="form-field">
                <label className="form-label">{cr.closingBalance}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  value={closingBalance}
                  onChange={(e) => setClosingBalance(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label">Notas (opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <button type="submit" className="button button-danger" disabled={loading}>
                {loading ? cr.closing : cr.closeShiftBtn}
              </button>
            </form>
          </article>
        )}

        {/* Resumen del turno activo */}
        {activeShift && (
          <article className="card">
            <h2>{cr.activeShift}</h2>
            <div className="arqueo-grid" style={{ marginTop: "1rem" }}>
              <div className="arqueo-row">
                <span className="arqueo-label">{cr.openingBalance}</span>
                <span className="arqueo-value">{formatCurrency(activeShift.opening_balance)}</span>
              </div>
              <div className="arqueo-row">
                <span className="arqueo-label">{cr.openedAt}</span>
                <span className="arqueo-value" style={{ fontSize: "0.9rem" }}>{formatDate(activeShift.opened_at)}</span>
              </div>
            </div>
          </article>
        )}
      </div>

      {/* Historial */}
      <article className="card">
        <h2>{cr.history}</h2>
        {history.length === 0 ? (
          <p className="muted" style={{ padding: "1rem 0" }}>{cr.noPastShifts}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{cr.openedAt}</th>
                  <th>{cr.openingBalance}</th>
                  <th>{cr.expectedCash}</th>
                  <th>{cr.actualCash}</th>
                  <th>{cr.difference}</th>
                  <th>{cr.status}</th>
                </tr>
              </thead>
              <tbody>
                {history.map((s) => (
                  <tr key={s.id}>
                    <td>{formatDate(s.opened_at)}</td>
                    <td>{formatCurrency(s.opening_balance)}</td>
                    <td>{s.expected_cash !== null ? formatCurrency(s.expected_cash) : "—"}</td>
                    <td>{s.closing_balance !== null ? formatCurrency(s.closing_balance) : "—"}</td>
                    <td>
                      <span className={`arqueo-value ${diffClass(s.difference)}`} style={{ fontSize: "0.95rem" }}>
                        {s.difference !== null ? formatCurrency(Math.abs(s.difference)) : "—"}
                        {s.difference !== null && s.difference > 0 && <span style={{ marginLeft: "0.3rem", fontSize: "0.75rem" }}>{cr.surplus}</span>}
                        {s.difference !== null && s.difference < 0 && <span style={{ marginLeft: "0.3rem", fontSize: "0.75rem" }}>{cr.shortage}</span>}
                        {s.difference === 0 && <span style={{ marginLeft: "0.3rem", fontSize: "0.75rem" }}>{cr.balanced}</span>}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge status-neutral">{cr.closed}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </div>
  );
}
