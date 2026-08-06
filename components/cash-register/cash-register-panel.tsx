"use client";

import { useState, useCallback, useEffect } from "react";
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
  sales_count?: number;
  sales_total?: number;
  expected_now?: number;
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

  // Al montar, recargamos para obtener las estadísticas de ventas del turno activo
  useEffect(() => {
    void reload();
  }, [reload]);

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
    if (!res.ok) {
      setError(data.error ?? cr.openError);
      return;
    }
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
    if (!res.ok) {
      setError(data.error ?? cr.closeError);
      return;
    }
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

  const diffLabel = (d: number | null) => {
    if (d === null) return "";
    if (d > 0) return cr.surplus;
    if (d < 0) return cr.shortage;
    return cr.balanced;
  };

  return (
    <section className="page-grid">
      <header className="page-header">
        <h1>{cr.title}</h1>
        <p>{cr.subtitle}</p>
      </header>

      {error ? <div className="alert alert-error">{error}</div> : null}

      {/* Estado actual del turno */}
      <div className={`shift-status-banner${activeShift ? " shift-open" : ""}`}>
        <div className="shift-status-info">
          <span className={`shift-badge ${activeShift ? "open" : "closed"}`}>
            {activeShift ? cr.open : cr.noActiveShift}
          </span>
          {activeShift ? (
            <p className="muted shift-status-meta">
              {cr.openedAt} {formatDate(activeShift.opened_at)}
              {activeShift.opener ? ` — ${cr.by} ${activeShift.opener.full_name}` : ""}
            </p>
          ) : (
            <p className="muted shift-status-meta">{cr.openPrompt}</p>
          )}
        </div>
      </div>

      {/* Resumen de ventas del turno activo */}
      {activeShift ? (
        <div className="cards-grid">
          <article className="card metric-card">
            <span className="metric-label">{cr.openingBalance}</span>
            <strong className="metric-value">{formatCurrency(activeShift.opening_balance)}</strong>
          </article>
          <article className="card metric-card">
            <span className="metric-label">{cr.salesCount}</span>
            <strong className="metric-value">{activeShift.sales_count ?? 0}</strong>
          </article>
          <article className="card metric-card">
            <span className="metric-label">{cr.salesTotal}</span>
            <strong className="metric-value">{formatCurrency(activeShift.sales_total ?? 0)}</strong>
          </article>
          <article className="card metric-card metric-card-accent">
            <span className="metric-label">{cr.expectedCash}</span>
            <strong className="metric-value">
              {formatCurrency(activeShift.expected_now ?? activeShift.opening_balance)}
            </strong>
          </article>
        </div>
      ) : null}

      <div className="two-columns">
        {/* Abrir turno */}
        {!activeShift ? (
          <article className="card">
            <h2>{cr.openShift}</h2>
            <form onSubmit={handleOpen} className="stacked-form">
              <div className="field">
                <label>{cr.openingBalance}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  placeholder="0.00"
                  required
                />
                <span className="field-hint">{cr.openingHint}</span>
              </div>
              <button type="submit" className="button" disabled={loading}>
                {loading ? cr.opening : cr.openShiftBtn}
              </button>
            </form>
          </article>
        ) : (
          /* Cerrar turno */
          <article className="card">
            <h2>{cr.closeShift}</h2>
            <form onSubmit={handleClose} className="stacked-form">
              <div className="field">
                <label>{cr.closingBalance}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={closingBalance}
                  onChange={(e) => setClosingBalance(e.target.value)}
                  placeholder="0.00"
                  required
                />
                <span className="field-hint">{cr.closingHint}</span>
              </div>
              <div className="field">
                <label>{cr.notes}</label>
                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={cr.notesPlaceholder} />
              </div>

              {/* Vista previa del arqueo */}
              {closingBalance !== "" ? (
                <div className="arqueo-preview">
                  <div className="arqueo-row">
                    <span>{cr.expectedCash}</span>
                    <span>{formatCurrency(activeShift.expected_now ?? activeShift.opening_balance)}</span>
                  </div>
                  <div className="arqueo-row">
                    <span>{cr.actualCash}</span>
                    <span>{formatCurrency(Number(closingBalance))}</span>
                  </div>
                  <div className="arqueo-row arqueo-row-total">
                    <span>{cr.difference}</span>
                    <span className={diffClass(Number(closingBalance) - (activeShift.expected_now ?? activeShift.opening_balance))}>
                      {formatCurrency(Number(closingBalance) - (activeShift.expected_now ?? activeShift.opening_balance))}
                    </span>
                  </div>
                </div>
              ) : null}

              <button type="submit" className="button button-danger" disabled={loading}>
                {loading ? cr.closing : cr.closeShiftBtn}
              </button>
            </form>
          </article>
        )}

        {/* Información del turno activo */}
        {activeShift ? (
          <article className="card">
            <h2>{cr.activeShift}</h2>
            <div className="detail-list">
              <div className="detail-row">
                <span className="muted">{cr.openedAt}</span>
                <span>{formatDate(activeShift.opened_at)}</span>
              </div>
              {activeShift.opener ? (
                <div className="detail-row">
                  <span className="muted">{cr.openedBy}</span>
                  <span>{activeShift.opener.full_name}</span>
                </div>
              ) : null}
              <div className="detail-row">
                <span className="muted">{cr.openingBalance}</span>
                <span>{formatCurrency(activeShift.opening_balance)}</span>
              </div>
              <div className="detail-row">
                <span className="muted">{cr.salesCount}</span>
                <span>{activeShift.sales_count ?? 0}</span>
              </div>
              <div className="detail-row">
                <span className="muted">{cr.salesTotal}</span>
                <span>{formatCurrency(activeShift.sales_total ?? 0)}</span>
              </div>
              <div className="detail-row detail-row-total">
                <span>{cr.expectedCash}</span>
                <span>{formatCurrency(activeShift.expected_now ?? activeShift.opening_balance)}</span>
              </div>
            </div>
          </article>
        ) : null}
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
                  <th>{cr.notes}</th>
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
                      <span className={`arqueo-diff ${diffClass(s.difference)}`}>
                        {s.difference !== null ? formatCurrency(s.difference) : "—"}
                        {s.difference !== null ? (
                          <small className="arqueo-diff-label">{diffLabel(s.difference)}</small>
                        ) : null}
                      </span>
                    </td>
                    <td className="notes-cell">{s.notes ? s.notes : <span className="muted">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </section>
  );
}
