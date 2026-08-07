import { formatDate } from "@/lib/utils";
import { BUSINESS_INFO } from "@/lib/business";

export type InvoiceData = {
  invoice_number: string;
  customer_name: string;
  payment_method: string;
  seller?: string;
  subtotal: number;
  discount_pct: number;
  tax_pct: number;
  total: number;
  items: { name: string; qty: number; unit_price: number; subtotal: number }[];
  date: string;
};

export type InvoiceLabels = {
  invoiceNumber: string;
  date: string;
  seller: string;
  customer: string;
  paymentMethod: string;
  product: string;
  quantity: string;
  unitPrice: string;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
};

const COLORS = {
  navy: [32, 42, 120] as [number, number, number],
  blue: [25, 118, 210] as [number, number, number],
  teal: [22, 181, 196] as [number, number, number],
  ink: [34, 42, 58] as [number, number, number],
  muted: [100, 112, 130] as [number, number, number],
  line: [220, 225, 235] as [number, number, number],
  soft: [244, 247, 252] as [number, number, number]
};

function pdfText(value: string | number) {
  return String(value).replace(/[·¡¿]/g, "-");
}

function pdfLabel(value: string) {
  return pdfText(value).replace(/\?+$/g, "");
}

function drawBrandMark(doc: any, x: number, y: number, size: number) {
  doc.setFillColor(...COLORS.blue);
  doc.roundedRect(x, y + size * 0.68, size, size * 0.16, size * 0.06, size * 0.06, "F");
  // jsPDF does not expose arc() in the browser build; approximate the cloche curve with line segments.
  doc.setDrawColor(...COLORS.navy);
  doc.setLineWidth(size * 0.06);
  const curve = [
    [x + size * 0.16, y + size * 0.67],
    [x + size * 0.25, y + size * 0.49],
    [x + size * 0.39, y + size * 0.38],
    [x + size * 0.5, y + size * 0.34],
    [x + size * 0.61, y + size * 0.38],
    [x + size * 0.75, y + size * 0.49],
    [x + size * 0.84, y + size * 0.67]
  ];
  for (let index = 1; index < curve.length; index += 1) {
    doc.line(curve[index - 1][0], curve[index - 1][1], curve[index][0], curve[index][1]);
  }
  doc.setDrawColor(...COLORS.teal);
  doc.setLineWidth(size * 0.08);
  doc.line(x + size * 0.36, y + size * 0.55, x + size * 0.48, y + size * 0.67);
  doc.line(x + size * 0.48, y + size * 0.67, x + size * 0.77, y + size * 0.34);
  doc.setFillColor(...COLORS.teal);
  doc.circle(x + size * 0.5, y + size * 0.28, size * 0.07, "F");
}

function drawColonSymbol(doc: any, x: number, y: number, size = 2.8) {
  // Draw the Costa Rican colon as vector strokes; this avoids missing-glyph artifacts.
  doc.setDrawColor(...COLORS.navy);
  doc.setLineWidth(0.45);
  doc.line(x + size * 0.95, y - size * 1.55, x + size * 0.25, y - size * 1.55);
  doc.line(x + size * 0.25, y - size * 1.55, x + size * 0.25, y + size * 0.15);
  doc.line(x + size * 0.25, y + size * 0.15, x + size * 0.95, y + size * 0.15);
  doc.setDrawColor(...COLORS.teal);
  doc.setLineWidth(0.3);
  doc.line(x + size * 0.72, y - size * 1.8, x + size * 0.72, y + size * 0.4);
  doc.line(x + size * 0.98, y - size * 1.8, x + size * 0.98, y + size * 0.4);
}

function moneyText(value: number) {
  return Number(value ?? 0).toFixed(2);
}

function drawMoney(doc: any, value: number, x: number, y: number, align: "left" | "right" = "left") {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(0, 0, 0);
  doc.text(`CRC ${moneyText(value)}`, x, y, { align });
}

function addText(doc: any, text: string, x: number, y: number, options: Record<string, unknown> = {}) {
  doc.text(pdfText(text), x, y, options);
}

async function buildDoc(sale: InvoiceData, l: InvoiceLabels) {
  const { jsPDF } = await import("jspdf");
  const doc: any = new jsPDF({ unit: "mm", format: "a5" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 10;
  let y = 12;

  // Keep the invoice logo-free; the original site logo remains unchanged.
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  addText(doc, BUSINESS_INFO.name, pageW / 2, y, { align: "center" });
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  addText(doc, BUSINESS_INFO.legalName, pageW / 2, y, { align: "center" });
  y += 4;
  addText(doc, `Ced. Jur. ${BUSINESS_INFO.taxId}`, pageW / 2, y, { align: "center" });
  y += 4;
  addText(doc, `${BUSINESS_INFO.address} - Tel. ${BUSINESS_INFO.phone}`, pageW / 2, y, { align: "center" });
  y += 4;
  addText(doc, BUSINESS_INFO.email, pageW / 2, y, { align: "center" });
  y += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  addText(doc, `${pdfLabel(l.invoiceNumber)} ${sale.invoice_number}`, pageW / 2, y, { align: "center" });
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  addText(doc, `${pdfLabel(l.date)}: ${pdfText(formatDate(sale.date))}`, pageW / 2, y, { align: "center" });
  y += 10;

  doc.setDrawColor(175, 175, 175);
  doc.setLineWidth(0.35);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  addText(doc, `${pdfLabel(l.customer)}:`, margin, y);
  doc.setFont("helvetica", "normal");
  addText(doc, sale.customer_name || "Consumidor final", margin + 31, y);
  doc.setFont("helvetica", "bold");
  addText(doc, `${pdfLabel(l.paymentMethod)}:`, pageW / 2 + 2, y);
  doc.setFont("helvetica", "normal");
  addText(doc, sale.payment_method, pageW / 2 + 31, y);
  if (sale.seller) {
    y += 5;
    doc.setFont("helvetica", "bold");
    addText(doc, `${pdfLabel(l.seller)}:`, margin, y);
    doc.setFont("helvetica", "normal");
    addText(doc, sale.seller, margin + 31, y);
  }
  y += 8;

  doc.setFillColor(...COLORS.navy);
  doc.roundedRect(margin, y, pageW - margin * 2, 8, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  addText(doc, pdfLabel(l.product), margin + 4, y + 5.2);
  addText(doc, pdfLabel(l.quantity), 82, y + 5.2, { align: "center" });
  addText(doc, "Precio", 101, y + 5.2, { align: "center" });
  addText(doc, "Total", pageW - margin - 6, y + 5.2, { align: "center" });
  y += 13;

  doc.setTextColor(...COLORS.ink);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  for (const [index, item] of sale.items.entries()) {
    if (index % 2 === 0) {
      doc.setFillColor(...COLORS.soft);
      doc.rect(margin, y - 4.2, pageW - margin * 2, 7, "F");
    }
    addText(doc, item.name.slice(0, 28), margin + 4, y);
    addText(doc, String(item.qty), 82, y, { align: "center" });
    drawMoney(doc, item.unit_price, 101, y, "right");
    drawMoney(doc, item.subtotal, pageW - margin - 6, y, "right");
    y += 7;
  }
  y += 3;

  doc.setDrawColor(...COLORS.line);
  doc.setLineWidth(0.35);
  doc.line(margin, y, pageW - margin, y);
  y += 7;

  const addTotalRow = (label: string, value: number, bold = false) => {
    doc.setTextColor(...(bold ? COLORS.navy : COLORS.muted));
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 11 : 8.5);
    addText(doc, pdfLabel(label), pageW - 57, y);
    drawMoney(doc, value, pageW - margin - 4, y, "right");
    y += bold ? 8 : 6;
  };

  addTotalRow(`${pdfLabel(l.subtotal)}:`, sale.subtotal);
  if (sale.discount_pct > 0) {
    addTotalRow(`${pdfLabel(l.discount)} (${sale.discount_pct}%):`, -(sale.subtotal * sale.discount_pct) / 100);
  }
  if (sale.tax_pct > 0) {
    addTotalRow(`${pdfLabel(l.tax)} (${sale.tax_pct}%):`, sale.subtotal * (1 - sale.discount_pct / 100) * (sale.tax_pct / 100));
  }
  addTotalRow(`${pdfLabel(l.total)}:`, sale.total, true);

  doc.setFillColor(...COLORS.teal);
  doc.roundedRect(margin, y + 2, pageW - margin * 2, 9, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  addText(doc, "Gracias por su compra", pageW / 2, y + 7.5, { align: "center" });
  return doc;
}

export async function downloadInvoicePdf(sale: InvoiceData, labels: InvoiceLabels) {
  const doc = await buildDoc(sale, labels);
  doc.save(`factura-${sale.invoice_number}.pdf`);
}

export async function printInvoicePdf(sale: InvoiceData, labels: InvoiceLabels) {
  const doc = await buildDoc(sale, labels);
  doc.autoPrint();
  const blobUrl = doc.output("bloburl");
  const printWindow = window.open(blobUrl as unknown as string, "_blank");
  if (!printWindow) {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = blobUrl as unknown as string;
    document.body.appendChild(iframe);
    setTimeout(() => document.body.removeChild(iframe), 60_000);
  }
}
