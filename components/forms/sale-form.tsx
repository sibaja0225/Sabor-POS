"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  sale_price: number;
  active: boolean;
};

type LineItem = {
  product_id: string;
  quantity: number;
};

export function SaleForm({ products }: { products: ProductOption[] }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [items, setItems] = useState<LineItem[]>([
    {
      product_id: products[0]?.id ?? "",
      quantity: 1
    }
  ]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = products.find((entry) => entry.id === item.product_id);
      return sum + (product?.sale_price ?? 0) * item.quantity;
    }, 0);
  }, [items, products]);

  function updateItem(index: number, payload: Partial<LineItem>) {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...payload } : item))
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        product_id: products[0]?.id ?? "",
        quantity: 1
      }
    ]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        customer_name: customerName,
        payment_method: paymentMethod,
        items
      })
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error ?? t.sales.saleError);
      return;
    }

    setMessage(`${t.sales.saleOk} ${result.invoice_number ?? ""}`);
    setCustomerName("");
    setPaymentMethod("efectivo");
    setItems([
      {
        product_id: products[0]?.id ?? "",
        quantity: 1
      }
    ]);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      {error ? <div className="alert alert-error">{error}</div> : null}
      {message ? <div className="alert alert-success">{message}</div> : null}
      <div className="inline-actions">
        <div className="field">
          <label>{t.sales.customer}</label>
          <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={t.common.optional} />
        </div>
        <div className="field">
          <label>{t.sales.paymentMethod}</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
            <option value="efectivo">{t.sales.cash}</option>
            <option value="sinpe">{t.sales.sinpe}</option>
            <option value="tarjeta">{t.sales.card}</option>
          </select>
        </div>
      </div>

      <div className="line-items">
        {items.map((item, index) => {
          const selectedProduct = products.find((product) => product.id === item.product_id);

          return (
            <div className="line-item-row" key={`${item.product_id}-${index}`}>
              <div className="field">
                <label>{t.sales.product}</label>
                <select
                  value={item.product_id}
                  onChange={(e) => updateItem(index, { product_id: e.target.value })}
                  required
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.stock} {t.sales.inStock})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>{t.sales.quantity}</label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct?.stock ?? 999}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                  required
                />
              </div>
              <button
                type="button"
                className="button-secondary"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
              >
                {t.common.remove}
              </button>
            </div>
          );
        })}
      </div>

      <button type="button" className="button-secondary" onClick={addItem}>
        {t.sales.addLine}
      </button>

      <div className="card" style={{ padding: "1rem" }}>
        <div className="muted">{t.sales.estimatedTotal}</div>
        <div className="metric-value">{formatCurrency(total)}</div>
      </div>

      <button className="button" type="submit" disabled={loading}>
        {loading ? t.sales.registering : t.sales.registerSale}
      </button>
    </form>
  );
}
