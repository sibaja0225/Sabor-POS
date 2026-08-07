import { formatCurrency, formatDate } from "@/lib/utils";
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

// Etiquetas necesarias para el PDF (se pasan desde el diccionario i18n activo)
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

// Use a bundled Unicode font so the Costa Rican colon and Spanish accents render correctly.
async function loadPdfFont(doc: { addFileToVFS: Function; addFont: Function; setFont: Function }) {
  const response = await fetch("/fonts/noto-sans-regular.ttf");
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const base64 = btoa(binary);

  doc.addFileToVFS("NotoSans-Regular.ttf", base64);
  doc.addFont("NotoSans-Regular.ttf", "NotoSans", "normal");
  doc.addFont("NotoSans-Regular.ttf", "NotoSans", "bold");
  doc.addFont("NotoSans-Regular.ttf", "NotoSans", "italic");
  doc.setFont("NotoSans", "normal");
}

function pdfText(value: string | number) {
  return String(value).replace(/·/g, "-");
}

function pdfCurrency(value: number) {
  return `₡ ${pdfText(formatCurrency(value)).replace(/^\s+/, "")}`;
}

function pdfLabel(value: string) {
  return pdfText(value).replace(/\?+$/g, "");
}

async function buildDoc(sale: InvoiceData, l: InvoiceLabels) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a5" });
  await loadPdfFont(doc);
  const pageW = doc.internal.pageSize.getWidth();
  let y = 14;

  // ── Encabezado del negocio ────────────────────────────────────────────
  doc.setFontSize(18);
  doc.setFont("NotoSans", "bold");
  doc.text(pdfText(BUSINESS_INFO.name), pageW / 2, y, { align: "center" });
  y += 6;

  doc.setFontSize(8);
  doc.setFont("NotoSans", "normal");
  doc.text(pdfText(BUSINESS_INFO.legalName), pageW / 2, y, { align: "center" });
  y += 4;
  doc.text(pdfText(`Ced. Jur. ${BUSINESS_INFO.taxId}`), pageW / 2, y, { align: "center" });
  y += 4;
  doc.text(pdfText(`${BUSINESS_INFO.address} - Tel. ${BUSINESS_INFO.phone}`), pageW / 2, y, { align: "center" });
  y += 4;
  doc.text(pdfText(BUSINESS_INFO.email), pageW / 2, y, { align: "center" });
  y += 7;

  // ── Datos de la factura ───────────────────────────────────────────────
  doc.setFontSize(10);
  doc.setFont("NotoSans", "bold");
  doc.text(`${pdfLabel(l.invoiceNumber)} ${pdfText(sale.invoice_number)}`, pageW / 2, y, { align: "center" });
  y += 5;
  doc.setFont("NotoSans", "normal");
  doc.setFontSize(9);
  doc.text(`${pdfLabel(l.date)}: ${pdfText(formatDate(sale.date))}`, pageW / 2, y, { align: "center" });
  y += 7;

  doc.setDrawColor(180);
  doc.line(10, y, pageW - 10, y);
  y += 5;

  doc.setFontSize(9);
  doc.setFont("NotoSans", "bold");
  doc.text(`${pdfLabel(l.customer)}:`, 10, y);
  doc.setFont("NotoSans", "normal");
  doc.text(pdfText(sale.customer_name), 45, y);
  y += 5;
  doc.setFont("NotoSans", "bold");
  doc.text(`${pdfLabel(l.paymentMethod)}:`, 10, y);
  doc.setFont("NotoSans", "normal");
  doc.text(pdfText(sale.payment_method), 45, y);
  if (sale.seller) {
    y += 5;
    doc.setFont("NotoSans", "bold");
    doc.text(`${pdfLabel(l.seller)}:`, 10, y);
    doc.setFont("NotoSans", "normal");
    doc.text(pdfText(sale.seller), 45, y);
  }
  y += 7;

  doc.line(10, y, pageW - 10, y);
  y += 5;

  // ── Cabecera de líneas ────────────────────────────────────────────────
  doc.setFont("NotoSans", "bold");
  doc.text(pdfLabel(l.product), 10, y);
  doc.text(pdfLabel(l.quantity), 88, y, { align: "right" });
  doc.text(pdfLabel(l.unitPrice), 120, y, { align: "right" });
  doc.text(pdfLabel(l.subtotal), pageW - 10, y, { align: "right" });
  y += 4;
  doc.line(10, y, pageW - 10, y);
  y += 5;

  doc.setFont("NotoSans", "normal");
  for (const item of sale.items) {
    doc.text(pdfText(item.name).slice(0, 30), 10, y);
    doc.text(String(item.qty), 88, y, { align: "right" });
    doc.text(pdfCurrency(item.unit_price), 120, y, { align: "right" });
    doc.text(pdfCurrency(item.subtotal), pageW - 10, y, { align: "right" });
    y += 6;
  }

  y += 2;
  doc.line(10, y, pageW - 10, y);
  y += 5;

  // ── Totales ───────────────────────────────────────────────────────────
  const addTotalRow = (label: string, value: string, bold = false) => {
    doc.setFont("NotoSans", bold ? "bold" : "normal");
    if (bold) doc.setFontSize(11);
    doc.text(pdfLabel(label), pageW - 55, y);
    doc.text(pdfText(value), pageW - 10, y, { align: "right" });
    if (bold) doc.setFontSize(9);
    y += 6;
  };

  addTotalRow(`${pdfLabel(l.subtotal)}:`, pdfCurrency(sale.subtotal));
  if (sale.discount_pct > 0) {
    addTotalRow(
      `${pdfLabel(l.discount)} (${sale.discount_pct}%):`,
      `- ${pdfCurrency((sale.subtotal * sale.discount_pct) / 100)}`
    );
  }
  if (sale.tax_pct > 0) {
    addTotalRow(
      `${pdfLabel(l.tax)} (${sale.tax_pct}%):`,
      pdfCurrency(sale.subtotal * (1 - sale.discount_pct / 100) * (sale.tax_pct / 100))
    );
  }
  addTotalRow(`${pdfLabel(l.total)}:`, pdfCurrency(sale.total), true);

  y += 6;
  doc.setFontSize(8);
  doc.setFont("NotoSans", "italic");
  doc.text("Gracias por su compra", pageW / 2, y, { align: "center" });

  return doc;
}

// Descarga el PDF de la factura
export async function downloadInvoicePdf(sale: InvoiceData, labels: InvoiceLabels) {
  const doc = await buildDoc(sale, labels);
  doc.save(`factura-${sale.invoice_number}.pdf`);
}

// Abre el diálogo de impresión con la factura
export async function printInvoicePdf(sale: InvoiceData, labels: InvoiceLabels) {
  const doc = await buildDoc(sale, labels);
  doc.autoPrint();
  const blobUrl = doc.output("bloburl");
  const printWindow = window.open(blobUrl as unknown as string, "_blank");
  // Si el navegador bloquea la ventana emergente, recurrimos a un iframe oculto
  if (!printWindow) {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = blobUrl as unknown as string;
    document.body.appendChild(iframe);
    setTimeout(() => document.body.removeChild(iframe), 60_000);
  }
}
