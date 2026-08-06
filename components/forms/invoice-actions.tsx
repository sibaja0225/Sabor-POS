"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import { downloadInvoicePdf, printInvoicePdf, type InvoiceData, type InvoiceLabels } from "@/lib/invoice-pdf";

type InvoiceActionsProps = {
  sale: {
    id: string;
    invoice_number: string;
    customer_name: string | null;
    payment_method: string;
  };
};

export function InvoiceActions({ sale }: InvoiceActionsProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [customerName, setCustomerName] = useState(sale.customer_name ?? "");
  const [paymentMethod, setPaymentMethod] = useState(sale.payment_method);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState("");

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

  async function fetchInvoice(): Promise<InvoiceData | null> {
    setError("");
    const response = await fetch(`/api/sales/${sale.id}`);
    const result = await response.json();

    if (!response.ok) {
      setError(result.error ?? t.sales.invoiceUpdateError);
      return null;
    }

    return result as InvoiceData;
  }

  async function handlePrint() {
    setPdfLoading(true);
    const data = await fetchInvoice();
    setPdfLoading(false);
    if (data) printInvoicePdf(data, invoiceLabels);
  }

  async function handleDownload() {
    setPdfLoading(true);
    const data = await fetchInvoice();
    setPdfLoading(false);
    if (data) downloadInvoicePdf(data, invoiceLabels);
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch(`/api/sales/${sale.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        customer_name: customerName,
        payment_method: paymentMethod
      })
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error ?? t.sales.invoiceUpdateError);
      return;
    }

    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    const confirmed = window.confirm(`${t.sales.confirmDeleteInvoice} ${sale.invoice_number}?`);

    if (!confirmed) return;

    setLoading(true);
    setError("");

    const response = await fetch(`/api/sales/${sale.id}`, {
      method: "DELETE"
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(result.error ?? t.sales.invoiceDeleteError);
      return;
    }

    router.refresh();
  }

  if (editing) {
    return (
      <div className="invoice-actions-panel">
        {error ? <div className="mini-error">{error}</div> : null}
        <form onSubmit={handleUpdate} className="invoice-edit-form">
          <input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder={t.sales.customer}
          />
          <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
            <option value="efectivo">{t.sales.cash}</option>
            <option value="tarjeta">{t.sales.card}</option>
            <option value="sinpe">{t.sales.sinpe}</option>
            <option value="mixto">{t.sales.mixed}</option>
          </select>
          <div className="table-actions">
            <button className="button" type="submit" disabled={loading}>
              {t.common.save}
            </button>
            <button className="button-secondary" type="button" onClick={() => setEditing(false)} disabled={loading}>
              {t.common.cancel}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="table-actions">
      {error ? <div className="mini-error">{error}</div> : null}
      <button className="button" type="button" onClick={handlePrint} disabled={pdfLoading || loading}>
        {pdfLoading ? t.common.loading : t.invoice.printInvoice}
      </button>
      <button className="button-secondary" type="button" onClick={handleDownload} disabled={pdfLoading || loading}>
        {t.invoice.downloadPdf}
      </button>
      <button className="button-secondary" type="button" onClick={() => setEditing(true)} disabled={loading}>
        {t.common.edit}
      </button>
      <button className="button-danger" type="button" onClick={handleDelete} disabled={loading}>
        {t.common.delete}
      </button>
    </div>
  );
}
