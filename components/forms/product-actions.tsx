"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";

type ProductActionsProps = {
  product: {
    id: string;
    name: string;
    category: string;
    sku: string;
    sale_price: number;
    cost_price: number;
    stock: number;
    min_stock: number;
    active: boolean;
  };
};

export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: product.name,
    category: product.category,
    sku: product.sku,
    sale_price: String(product.sale_price),
    cost_price: String(product.cost_price),
    stock: String(product.stock),
    min_stock: String(product.min_stock),
    active: product.active
  });

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        sale_price: Number(form.sale_price),
        cost_price: Number(form.cost_price),
        stock: Number(form.stock),
        min_stock: Number(form.min_stock)
      })
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error ?? t.products.updateError);
      return;
    }

    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm(`${t.products.confirmDelete} ${product.name}?`);
    if (!confirmed) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error ?? t.products.deleteError);
      return;
    }

    router.refresh();
  }

  if (editing) {
    return (
      <div className="invoice-actions-panel">
        {error ? <div className="mini-error">{error}</div> : null}
        <form onSubmit={handleUpdate} className="invoice-edit-form">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t.products.name} />
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder={t.products.category} />
          <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder={t.products.sku} />
          <input type="number" step="0.01" value={form.sale_price} onChange={(e) => setForm({ ...form, sale_price: e.target.value })} placeholder={t.products.salePrice} />
          <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder={t.products.stock} />
          <select value={form.active ? "true" : "false"} onChange={(e) => setForm({ ...form, active: e.target.value === "true" })}>
            <option value="true">{t.common.active}</option>
            <option value="false">{t.common.inactive}</option>
          </select>
          <div className="table-actions">
            <button className="button" type="submit" disabled={loading}>{t.common.save}</button>
            <button className="button-secondary" type="button" onClick={() => setEditing(false)} disabled={loading}>{t.common.cancel}</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="table-actions">
      {error ? <div className="mini-error">{error}</div> : null}
      <button className="button-secondary" type="button" onClick={() => setEditing(true)} disabled={loading}>{t.common.edit}</button>
      <button className="button-danger" type="button" onClick={handleDelete} disabled={loading}>{t.common.delete}</button>
    </div>
  );
}
