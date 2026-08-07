"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";

export function InventoryForm({
  products
}: {
  products: Array<{ id: string; name: string; sku: string }>;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [movementType, setMovementType] = useState("in");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/inventory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        product_id: productId,
        movement_type: movementType,
        quantity: Number(quantity),
        notes
      })
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error ?? t.inventory.movementError);
      return;
    }

    setMessage(t.inventory.movementSaved);
    setQuantity("1");
    setNotes("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-success">{message}</div> : null}
      <div className="field">
        <label>{t.inventory.product}</label>
        <select value={productId} onChange={(e) => setProductId(e.target.value)} required>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.sku})
            </option>
          ))}
        </select>
      </div>
      <div className="inline-actions">
        <div className="field">
          <label>{t.inventory.movementType}</label>
          <select value={movementType} onChange={(e) => setMovementType(e.target.value)} required>
            <option value="in">{t.inventory.in}</option>
            <option value="out">{t.inventory.out}</option>
            <option value="adjustment">{t.inventory.adjustment}</option>
          </select>
        </div>
        <div className="field">
          <label>{t.inventory.quantity}</label>
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </div>
      </div>
      <div className="field">
        <label>{t.inventory.notes}</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
      </div>
      <button className="button" type="submit" disabled={loading}>
        {loading ? t.common.saving : t.inventory.registerMovement}
      </button>
    </form>
  );
}
