"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { downloadInvoicePdf, printInvoicePdf, type InvoiceData, type InvoiceLabels } from "@/lib/invoice-pdf";

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

type LastSale = {
  invoice_number: string;
  customer_name: string;
  payment_method: string;
  subtotal: number;
  discount_pct: number;
  tax_pct: number;
  total: number;
  items: { name: string; qty: number; unit_price: number; subtotal: number }[];
  date: string;
};

export function SaleForm({ products }: { products: ProductOption[] }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [discountPct, setDiscountPct] = useState(0);
  const [taxPct, setTaxPct] = useState(13); // IVA CR por defecto
  const [items, setItems] = useState<LineItem[]>([{ product_id: products[0]?.id ?? "", quantity: 1 }]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSale, setLastSale] = useState<LastSale | null>(null);

  const { subtotal, discountAmt, taxAmt, total } = useMemo(() => {
    const sub = items.reduce((sum, item) => {
      const product = products.find((p) => p.id === item.product_id);
      return sum + (product?.sale_price ?? 0) * item.quantity;
    }, 0);
    const disc = sub * (discountPct / 100);
    const afterDisc = sub - disc;
    const tax = afterDisc * (taxPct / 100);
    return { subtotal: sub, discountAmt: disc, taxAmt: tax, total: afterDisc + tax };
  }, [items, products, discountPct, taxPct]);

  function updateItem(index: number, payload: Partial<LineItem>) {
    setItems((cur) => cur.map((item, i) => (i === index ? { ...item, ...payload } : item)));
  }

  function addItem() {
    setItems((cur) => [...cur, { product_id: products[0]?.id ?? "", quantity: 1 }]);
  }

  function removeItem(index: number) {
    setItems((cur) => cur.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setLastSale(null);

    const response = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: customerName,
        payment_method: paymentMethod,
        discount_pct: discountPct,
        tax_pct: taxPct,
        items
      })
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error ?? t.sales.saleError);
      return;
    }

    const saleItems = items.map((item) => {
      const product = products.find((p) => p.id === item.product_id);
      return {
        name: product?.name ?? item.product_id,
        qty: item.quantity,
        unit_price: product?.sale_price ?? 0,
        subtotal: (product?.sale_price ?? 0) * item.quantity
      };
    });

    setLastSale({
      invoice_number: result.invoice_number ?? "",
      customer_name: customerName || t.common.finalConsumer,
      payment_method: paymentMethod,
      subtotal,
      discount_pct: discountPct,
      tax_pct: taxPct,
      total,
      items: saleItems,
      date: new Date().toISOString()
    });

    setCustomerName("");
    setPaymentMethod("efectivo");
    setDiscountPct(0);
    setTaxPct(13);
    setItems([{ product_id: products[0]?.id ?? "", quantity: 1 }]);
    router.refresh();
  }

  const invoiceLabels: InvoiceLabels = {
    invoiceNumber: t.invoice.invoiceNumber,
    date: t.invoice.date,
    seller: t.invoice.seller,
    customer: t.sales.customer,
    paymentMethod: t.sales.paymentMethod,
    product: t.products.product,
    quantity: t.sales.quantity,
    unitPrice: t.invoice.unitPrice,
    subtotal: t.invoice.subtotal,
    discount: t.invoice.discount,
    tax: t.invoice.tax,
    total: t.invoice.total
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      {error ? <div className="alert alert-error">{error}</div> : null}

      {lastSale ? (
        <div className="alert alert-success" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <strong>{t.sales.saleOk} {lastSale.invoice_number}</strong>
          <div className="table-actions">
            <button
              type="button"
              className="button-secondary"
              onClick={() => downloadInvoicePdf(lastSale as InvoiceData, invoiceLabels)}
            >
              {t.invoice.downloadPdf}
            </button>
            <button
              type="button"
              className="button"
              onClick={() => printInvoicePdf(lastSale as InvoiceData, invoiceLabels)}
            >
              {t.invoice.printInvoice}
            </button>
          </div>
        </div>
      ) : null}

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
            <option value="mixto">{t.sales.mixed}</option>
          </select>
        </div>
      </div>

      <div className="line-items">
        {items.map((item, index) => {
          const selectedProduct = products.find((p) => p.id === item.product_id);
          return (
            <div className="line-item-row" key={`${item.product_id}-${index}`}>
              <div className="field">
                <label>{t.sales.product}</label>
                <select
                  value={item.product_id}
                  onChange={(e) => updateItem(index, { product_id: e.target.value })}
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.stock} {t.sales.inStock})
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

      {/* IVA y Descuento */}
      <div className="invoice-totals">
        <div className="invoice-totals-row">
          <span>{t.invoice.subtotal}</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="invoice-totals-row">
          <label htmlFor="discount-pct">{t.invoice.discountPct}</label>
          <input
            id="discount-pct"
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={discountPct}
            onChange={(e) => setDiscountPct(Math.min(100, Math.max(0, Number(e.target.value))))}
          />
        </div>
        {discountPct > 0 && (
          <div className="invoice-totals-row">
            <span>{t.invoice.discount}</span>
            <span style={{ color: "var(--danger)" }}>-{formatCurrency(discountAmt)}</span>
          </div>
        )}
        <div className="invoice-totals-row">
          <label htmlFor="tax-pct">{t.invoice.taxPct}</label>
          <input
            id="tax-pct"
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={taxPct}
            onChange={(e) => setTaxPct(Math.min(100, Math.max(0, Number(e.target.value))))}
          />
        </div>
        {taxPct > 0 && (
          <div className="invoice-totals-row">
            <span>{t.invoice.tax} ({taxPct}%)</span>
            <span>{formatCurrency(taxAmt)}</span>
          </div>
        )}
        <div className="invoice-totals-row total-row">
          <span>{t.invoice.total}</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <button className="button" type="submit" disabled={loading}>
        {loading ? t.sales.registering : t.sales.registerSale}
      </button>
    </form>
  );
}
